#! /bin/bash

scripts=scripts/*.js
tests=tests/*.js
bundle=bundle.js
site=site/

bold=$(tput bold)
boldred=${bold}$(tput setaf 1) 
boldgreen=${bold}$(tput setaf 2) 
boldyellow=${bold}$(tput setaf 3)
reset=$(tput sgr0)

./node_modules/jasmine-node/bin/jasmine-node $tests
if [[ $? -ne 0 ]]; then
  echo -e "\n${boldred}Failed tests$reset"
  exit 1
else
  echo -e "\n${boldgreen}PASSED!$reset"
fi
./node_modules/jslint/bin/jslint.js --maxlen 110 --indent 2 --regexp --plusplus --es5 --devel --continue $scripts
if [[ $? -ne 0 ]]; then
  echo -e "\n${boldred}Failed jslint$reset"
  exit 1
else
  echo -e "\n${boldgreen}PASSED!$reset"
fi
rm -f $site/$bundle
./node_modules/browserify/bin/cmd.js $scripts -o $site/$bundle
