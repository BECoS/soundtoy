var Whitenoise = function(context) {
  this.context = context;
  this.node = context.createJavaScriptNode(1024, 1, 2);
  this.node.onaudioprocess = this.process;
}

Whitenoise.prototype.process = function(e) {
  var data0 = e.outputBuffer.getChannelData(0);
  var data1 = e.outputBuffer.getChannelData(1);
  for (var i = 0; i < data0.length; i++) {
    data0[i] = ((Math.random() * 2) - 1);
    data1[i] = data0[i];
  }
};

Whitenoise.prototype.connect = function(node) {
  this.node.connect(node);
};
