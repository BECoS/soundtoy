#! /usr/bin/env bash
 

trap "$0" SIGINT

scriptdir=scripts
scripts=$scriptdir/*.js
specdir=specs
specs=$specdir/*.spec.js
bundle=bundle.js
site=site
specBundle=specBundle.js

jasmineReqs="jasmine.js jasmine-html.js jasmine.css"

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

./node_modules/browserify/bin/cmd.js $specs -o $site/$specBundle
./node_modules/browserify/bin/cmd.js $scripts -o $site/$bundle

for req in $jasmineReqs
do
  if [[ ! -e $site/$req ]]; then
    cp ./node_modules/jasmine-node/node_modules/jasmine-reporters/ext/$req $site
  fi
done

echo -e "\n${blue}Listening on 80${reset}"
echo -ne "${white}Ctrl-c to restart. Use Ctrl-\ to quit.${reset}\t"
node app.js
