function Widget() {
  Object.freeze(this);
}

Widget.prototype.attach = function () {
};

Widget.prototype.hide = function () {
  this.$element.hide();
};

Widget.prototype.show = function () {
  this.$element.show();
};

module.exports = Widget;
