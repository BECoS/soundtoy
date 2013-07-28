window.$ = window.jQuery = require('jquery-browserify');
window._ = require('underscore');

require('../node_modules/jquery-ui/jquery-ui.js').jqueryui();

function isArrayLike(obj) {
  if (obj instanceof Array) {
    return true;
  }
  if (obj.hasOwnProperty('length') && obj.hasOwnProperty('0')) {
    return true;
  }
  return false;
}

function pprint(obj) {
  if (isArrayLike(obj)) {
    console.log(prettyArray(obj));
  }
}

function prettyArray(obj) {
  var prettyStr = '';

}

window.Util = {
  dbg : {},
  attach : function (func) {
    this.func = func;
  }
};


exports.existy = function (thing) { 
  return thing != null; 
} 

exports.truthy = function (thing) { 
  return thing !== false && exports.existy(thing); 
} 
