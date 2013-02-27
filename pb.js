sc = require('demo/closure.js')
sc = require('./demo/closure.js')
sc = require('./demo/tuner.js')
sc = require('./demo/closure.js')
sc = require('./demo/closure.js')
delete global.require.cache['/home/alex/workspace/soundtoy/demo/closure.js']
sc
delete sc
sc
sc = require('./demo/closure.js')
sc = require('./demo/closure.js')
delete global.require.cache['/home/alex/workspace/soundtoy/demo/closure.js']
sc = require('./demo/closure.js')
delete global.require.cache['/home/alex/workspace/soundtoy/demo/closure.js']
delete sc
sc = require('./demo/closure.js')
delete global.require.cache['/home/alex/workspace/soundtoy/demo/closure.js']
delete sc
sc = require('./demo/closure.js')
delete global.require.cache['/home/alex/workspace/soundtoy/demo/closure.js']
sc = require('./demo/closure.js')
delete global.require.cache['/home/alex/workspace/soundtoy/demo/closure.js']
delete sc
sc = require('./demo/closure.js')
st = require('./demo/tuner.js')
st = require('./demo/tuner.js')
function pitchBuilder(offset) {
return 440*12*Math.log(2, offset);
}
pitchBuilder(1)
Math.log(2, 1)
Math.log(1, 2)
Math.log(2)
2*Math.log(2)
2*Math.log(1)
Math.log(1)/Math.log(2)
Math.log(2)/Math.log(2)
Math.log(3)/Math.log(2)
Math.log(4)/Math.log(2)
Math.log(8)/Math.log(2)
function pitchBuilder(offset) {
return 440*12*Math.log(offset)/Math.log(2);
}
pitchBuilder(2)
pitchBuilder(1)
pitchBuilder(2)
pitchBuilder(3)
function pitchBuilder(offset) {
return 440*Math.pow(2, offset/12);
}
pitchBuilder(1)
pitchBuilder(2)
sc
st
st.chromatic[0]
st.chromatic[40]
st.chromatic[360]
st.chromatic[100]
st.chromatic[200]
st.chromatic[150]
st.chromatic[125]
st.chromatic[140]
st.chromatic[150]
st.chromatic[145]
st.chromatic[142]
st.chromatic[143]
pitchBuilder(1) === st.chromatic[144]
pitchBuilder(2) === st.chromatic[144]
pitchBuilder(2) === st.chromatic[145]
pitchBuilder(3) === st.chromatic[146]
st.chromatic[146]
pitchBuilder(3)
