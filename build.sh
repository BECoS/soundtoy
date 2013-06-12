#! /usr/bin/env bash
 
trap cleanUp SIGINT

port=$(egrep -o 'listen\([0-9]+\)' app.js | egrep -o '[0-9]+')
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
  browserifyCmd="./node_modules/browserify/bin/cmd.js $scripts -o $site/$bundle"
  echo -e "\n${white}Browserify packaging elapsed time:"
  time -p $browserifyCmd
  #./node_modules/browserify/bin/cmd.js -r ./node_modules/jquery-browserify/src/jquery.js -o $site/common.js
  #./node_modules/browserify/bin/cmd.js --fast -x $site/common.js $specs -o $site/$specBundle
  #./node_modules/browserify/bin/cmd.js --fast -x $site/common.js $scripts -o $site/$bundle
  echo "${reset}"
}

## Begin Script ##
cd dirname $0
rm -f $site/$bundle
rm -f $site/$specBundle

echo -e "\n${yellow}Checking style...${reset}"
./node_modules/jshint/bin/hint --config ./jshint_config.json --show-non-errors $scripts
if [[ $? -ne 0 ]]; then
  echo -e "\n${boldred}Failed jshint$reset"
  exit 1
else
  echo -e "\n${boldgreen}PASSED!$reset"
fi

packageJS

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
