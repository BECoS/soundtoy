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

rm -f $site/$bundle
./node_modules/browserify/bin/cmd.js $scripts -o $site/$bundle 
./node_modules/jslint/bin/jslint.js $scripts
if [[ $? -ne 0 ]]; then
  echo "${boldred}Failed jslint$reset"
else
  echo "${boldgreen}PASSED!$reset"
fi
./node_modules/jasmine-node/bin/jasmine-node $tests
if [[ $? -ne 0 ]]; then
  echo "${boldred}Failed tests$reset"
else
  echo "${boldgreen}PASSED!$reset"
fi

