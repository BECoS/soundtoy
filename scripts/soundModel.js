var channels = [];

function Channel(scale, beats) {
  this.scale = scale || 8;
  this.beats = beats || 8;
}

function channelFactory(scale, beats, synth) {
  channels.push(new Channel(scale, beats, synth));
  return channels.length;
}
