function Widget() {
  Object.freeze(this);
}

Widget.prototype.attach = function ($container) {
  this.$element.remove();
  this.$element.appendTo( $container );
  return this;
};

Widget.prototype.remove = function () {
  this.$element.remove();
  return this;
};

Widget.prototype.hide = function () {
  this.$element.hide();
  return this;
};

Widget.prototype.show = function () {
  this.$element.show();
  return this;
};

module.exports = Widget;
