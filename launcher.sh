#! /usr/bin/env bash
 

trap "$0" SIGINT

port=$(egrep -o 'listen\([0-9]+\)' app.js | egrep -o '[0-9]+')
scriptdir=lib
scripts=$scriptdir/*.js
specdir=specs
specs=$specdir/*.spec.js
bundle=bundle.js
site=site
specBundle=specBundle.js

bold=$(tput bold)
boldred=${bold}$(tput setaf 1) 
boldgreen=${bold}$(tput setaf 2) 
yellow=$(tput setaf 3)
white=$(tput setaf 7)
reset=$(tput sgr0)
blue=$(tput setaf 4)
hidecursor=$(tput civis)
showcursor=$(tput cnorm)

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

#./node_modules/browserify/bin/cmd.js -r ./node_modules/jquery-browserify/lib/jquery.js -o $site/common.js
./node_modules/browserify/bin/cmd.js --fast -x $site/common.js $specs -o $site/$specBundle
./node_modules/browserify/bin/cmd.js --fast -x $site/common.js $scripts -o $site/$bundle

netstat -anp tcp 2>/dev/null | awk '$6 == "LISTEN"' | grep -o $port &> /dev/null
if [[ $? -eq 0 ]]; then
  echo "${boldred}Port $port is in use already${reset}"
  exit 1
else
  echo -e "\n${blue}Listening on $port ${reset}"
  echo -ne "${white}Ctrl-c to restart. Use Ctrl-\ to quit.${reset}\t"
  node app.js
fi
