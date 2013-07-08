window.$ = window.jQuery = require('jquery-browserify');
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
  dbg : {}
};
