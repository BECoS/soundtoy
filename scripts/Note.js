exports.Note = function (beat, oscillator) {
  return Object.create({
    beat : beat || 0,
    oscillator : oscillator || undefined,
    active : false
  });
};
