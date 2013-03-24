function StopwatchWA() {
  var count = 0;
  var sum = 0;
  var start = new Date();
  var context = new webkitAudioContext();
  
  (function () {
    var dummyNode = context.createJavaScriptNode(256, 1, 1);
    dummyNode.connect(context.destination);
    dummyNode.onaudioprocess = function (event) {
      var next = new Date();
      var elapsed = (next - start);
      start = next;
      count++;
      sum += elapsed;
      if (count % 1000) {
        console.log("Average is " + (sum / count));
      } 
    };
  })();
}

function StopwatchInterval() {
  var count = 0;
  var sum = 0;
  var start = new Date();

  setInterval(function () {
    var next = new Date();
    var elapsed = (next - start);
    start = next;
    count++;
    sum += elapsed;
    if (count % 1000) {
      console.log("Average is " + (sum / count));
    } 
  }, 0);
}
