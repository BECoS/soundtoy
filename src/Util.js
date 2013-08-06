window.$ = window.jQuery = require('jquery-browserify');
window._ = require('underscore');

(function ($) {

  $.fn.seq = function (num) {
    if ( !exports.existy(num) ) {
      num = parseInt(this.attr('sequence'), 10);
      return num;
    }

    return this.attr('sequence', num);
  };

  $.fn.row = function () {
    return this.attr('row');
  };

  $.fn.col = function () {
    return this.attr('col');
  };
    
  //$.fn.clearSeq = function () {
  //  var startingObj = this;
  //  var removeClicked = function (cur) {
  //    cur.removeClass('clicked');
  //  };

  //  for ( var cur = this; cur.seq() < cur.prev().seq(); cur = cur.prev() ) {}

  //  for ( ; cur.seq() > cur.next().seq(); cur = cur.next() ) {
  //    cur.seq(0);
  //    cur.addClass('clicked');
  //    setTimeout( removeClicked, 450, cur);
  //    cur.removeClass('joined active');
  //  }
  //  return startingObj;
  //};

})(jQuery);

require('../node_modules/jquery-ui/jquery-ui.js').jqueryui();

exports.isArrayLike = function (obj)  {
  if (obj instanceof Array) {
    return true;
  }
  if (obj.hasOwnProperty('length') && obj.hasOwnProperty('0')) {
    return true;
  }
  return false;
};

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
  },
  smodel : require('./soundModel.js'),
  gmodel : require('./gridModel.js'),
  grid : require('./grid.js'),
  figure : function (x, y) {
    return $('rect[col="' + x + '"][row="' + y + '"]');  
  }
};

window.existy = exports.existy = function (thing) { 
  return thing != null; 
};

window.truthy = exports.truthy = function (thing) { 
  return thing !== false && exports.existy(thing); 
};
