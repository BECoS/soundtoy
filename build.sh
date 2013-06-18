#! /usr/bin/env bash
 
trap cleanUp SIGINT

while getopts ":w" opt; do
  case $opt in
    #c)
    #  echo "Minifying css"
    #  ;;
    #m) 
    #  echo "Minifying js"  
    #  ;;
    #s)
    #  echo "Skipping JSHint"
    #  ;;
    w)
      echo "Watching for changes to rebrowserify" 
      watch=true
      ;;
    \?)
      echo "Error: unrecognized flag -$OPTARG" >&2
      exit 1
      ;;
  esac
done

port=$(egrep -o 'listen\([0-9]+\)' app.js | egrep -o '[0-9]+')

BROWSERIFY=./node_modules/browserify/bin/cmd.js
JSHINT=./node_modules/jshint/bin/jshint 
NODE=node

jshintconf=./jshint_config.json
scriptdir=src
scripts=$scriptdir/*.js
specdir=specs
specs=$specdir/*.spec.js
bundle=bundle.js
site=www
specBundle=specBundle.js

bold=$(tput bold)
boldred=${bold}$(tput setaf 1) 
boldgreen=${bold}$(tput setaf 2) 
green=$(tput setaf 2) 
yellow=$(tput setaf 3)
blue=$(tput setaf 4)
white=$(tput setaf 7)
reset=$(tput sgr0)
hidecursor=$(tput civis)
showcursor=$(tput cnorm)

function cleanUp {
  shouldExit=1
}

function packageJS {
  $BROWSERIFY $scripts -o $site/$bundle
  echo -e "\n${white}Browserify packaging elapsed time:"
  time -p $browserifyCmd
  #./node_modules/browserify/bin/cmd.js -r ./node_modules/jquery-browserify/src/jquery.js -o $site/common.js
  #./node_modules/browserify/bin/cmd.js --fast -x $site/common.js $specs -o $site/$specBundle
  #./node_modules/browserify/bin/cmd.js --fast -x $site/common.js $scripts -o $site/$bundle
  echo "${reset}"
}

cd dirname $0
rm -f $site/$bundle
rm -f $site/$specBundle

echo -e "\n${yellow}Checking style...${reset}"
$JSHINT --config $jshintconf --show-non-errors $scripts
if [[ $? -ne 0 ]]; then
  echo -e "\n${boldred}Failed jshint$reset"
  exit 1
else
  echo -e "\n${boldgreen}PASSED!$reset"
fi

packageJS

if [[ "$watch" != "true" ]]; then
  exit 0
fi

netstat -anp tcp 2>/dev/null | awk '$6 == "LISTEN"' | grep -o $port &> /dev/null

if [[ $? == 0 ]]; then
  echo "${boldred}Port $port is in use already${reset}"
  exit 1
else
  echo -e "\n${blue}Listening on $port ${reset}"
  node app.js & pid=$!

  shouldExit=0
  stamps=$(echo $(stat -c %Y $scripts) | md5sum | awk '{ print $1 }')

  while [[ "$shouldExit" -ne 1 ]]
  do
    freshStamps=$(echo $(stat -c %Y $scripts) | md5sum | awk '{ print $1 }')
    if [[ $freshStamps != $stamps ]]; then
      echo "${green}Change detected. Repackaging${reset}"
      stamps=$freshStamps
      packageJS
    fi
    sleep 1
  done

  kill -9 $pid
fi
