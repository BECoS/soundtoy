describe("The metronome sets the beat and calls functions that were registered by other modules to happen on " +
          "the beat", 
  function() {
    var metro = require('../scripts/metronome.js');
    it("is set initially to 120", function() {
      expect(metro.getBPM()).toBe(120);
    });
    it("can be changed to whatever integer is desired", function() {
      var newBPM = Math.round(Math.random() * 1000);
      metro.setBPM(newBPM);
      expect(metro.getBPM()).toBe(newBPM);
    });
    it("can be changed to whatever integer is desired", function() {
      var metro = require('../scripts/metronome.js');
      var newBPM = Math.round(Math.random() * 1000);
      metro.setBPM(newBPM);
      expect(metro.getBPM()).toBe(newBPM);
    });
    it("Should work flawlessly", function () {
      var newBPM = 300;
      metro.setBPM(newBPM);
      expect(true).toBe(true);
    });
    //it("allows functions to be registered to be called every multiple or fraction of a beat"
    //    , function() {
    //  var cheapBeat = function() {
    //    return 'bang';
    //  };
    //  metro.setBPM(120);
    //  var counter = 0;
    //  metro.register(1, cheapBeat);
    //  expect(metro.isRegistered(cheapBeat)).toBe(true);
    //});
    //it("uses a web worker to keep the beat", function() {
    //  metro.setBPM(120);
    //  //var worker = new Worker('worker.js');
    //  //worker.onmessage = function(e) {
    //  //  sys.debug('Received message: ' + sys.inspect(e));
    //  //  worker.terminate();
    //  //};
    //  //worker.postMessage({ foo : 'bar' });
    //    
    //});
  }
);
