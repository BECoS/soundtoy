describe("The metronome sets the beat and calls functions that were registered by other modules to happen on " +
          "the beat", 
  function() {
    it("is set initially to 120", function() {
      var metronome = require('../scripts/metronome.js');
      expect(metronome.getBPM()).toBe(120);
    });
    it("can be changed to whatever integer is desired", function() {
      var metronome = require('../scripts/metronome.js');
      var newBPM = Math.round(Math.random() * 1000);
      metronome.setBPM(newBPM);
      expect(metronome.getBPM()).toBe(newBPM);
    });
  }
);
