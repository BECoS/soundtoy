"use strict";

var BPM = 120;
var getBPM = function () { return BPM; };
var setBPM = function (newBPM) { BPM = newBPM; };
exports.getBPM = getBPM;
exports.setBPM = setBPM;
