#! /usr/bin/env bash

trap "exec $0" SIGINT

scriptdir=scripts
scripts=$scriptdir/*.js
testdir=tests
tests=$testdir/*.js
bundle=bundle.js
site=site

bold=$(tput bold)
boldred=${bold}$(tput setaf 1) 
boldgreen=${bold}$(tput setaf 2) 
yellow=$(tput setaf 3)
white=$(tput setaf 7)
reset=$(tput sgr0)
blue=$(tput setaf 4)

# Somehow we need phantomjs browser testing that doesn't use browserify/node modules
function prepareTestPage {
  return 1
}

rm -f $site/$bundle
rm -f $site/$worker
cp scripts/worker.js $site/

echo -e "\n${yellow}Running tests${reset}"
./node_modules/jasmine-node/bin/jasmine-node $tests
if [[ $? -ne 0 ]]; then
  echo -e "\n${boldred}Failed tests$reset"
  exit 1
else
  echo -e "\n${boldgreen}PASSED!$reset"
fi
echo -e "\n${yellow}Checking style...${reset}"
./node_modules/jshint/bin/hint --show-non-errors $scripts
if [[ $? -ne 0 ]]; then
  echo -e "\n${boldred}Failed jshint$reset"
  exit 1
else
  echo -e "\n${boldgreen}PASSED!$reset"
fi
./node_modules/browserify/bin/cmd.js $scripts -i 'scripts/worker.js' -o $site/$bundle
echo -e "\n${blue}Listening on `egrep -o 'listen\([0-9]+\)' app.js | egrep -o '[0-9]+'`${reset}"
echo "${white}Ctrl-c to restart. Use Ctrl-\ to quit.${reset}"
node app.js
