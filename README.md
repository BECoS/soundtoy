Toneblaster
===========
* * *
Toneblaster is a website for making music.

Building it requires node, npm, grunt-cli, and bower to be installed and on your path. You can get bower
and grunt-cli from npm but remember to install them globally with -g, e.g., `npm install -g bower`. Toneblaster
uses KineticJS which it fetches using bower. To build Kinetic requires the thor, uglifier, json-pure gems to be installed.
You can forgo this step by getting a prebuilt version of Kinetic and putting it at the location referenced in
www/index.html.

Once the tools are setup:

`npm install`
`npm start`

During development use grunt to rebuild:

`grunt`

Or grunt watch to rebuild whenever changes to the src files are made:

`grunt watch`

Toneblaster uses the WebAudio API to provide sound synthesis and sequencing. The sequencer grid is meant
to be more intuitive than the traditional piano roll.

