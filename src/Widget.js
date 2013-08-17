function Widget($element) {
  this.$element = $element;
}

Widget.prototype.attach = function ($container) {
  this.$element.appendTo($container);
};

Widget.prototype.remove = function () {
    this.$element.remove();
};

module.exports = Widget;
