"use strict";

/* global */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {};
(function (formatters) {
  /**
   * A formatter for integer data
   * @param {Object[]} args               Column options (see textFormatter for more options)
   */
  function intFormatter(args) {
    var iargs = Object.assign({
      min: undefined,
      max: undefined
    }, args);
    // Create formatter object
    var obj = controls.itemListFormatters.textFormatter(iargs);
    obj.input = inputOverride(obj.input);
    return obj;
  }

  /**
   * Render input form override
   */
  function inputOverride(baseInput) {
    return function (number) {
      var element = baseInput.call(this, number);
      element.addClass('item-list-int-formatter');
      var input = element.find('input');
      input.attr('type', 'number');
      if (this.args.min !== undefined) {
        input.attr('min', this.args.min);
      }
      if (this.args.max !== undefined) {
        input.attr('max', this.args.max);
      }
      return element;
    };
  }
  formatters.intFormatter = intFormatter;
})(controls.itemListFormatters); // eslint-disable-line