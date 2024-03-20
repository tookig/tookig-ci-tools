"use strict";

/* global $ */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {};
(function (formatters) {
  /**
   * A formatter for selecting predefined items
   * @param {Object[]} args                    Column options
   * @param {boolean} [args.readOnly=false]    Flag for if the column is read only or editable.
   * @param {object[]} args.options            Array with options to choose from, or a Promise returning the options.
   * @param {string}   args.options.value      The value of the option item
   * @param {string}   args.options.text       The text to display for the option item
   */
  function optionsFormatter(args) {
    var iargs = Object.assign({
      readOnly: false,
      options: []
    }, args);
    // Create formatter object
    var obj = controls.itemListFormatters.textFormatter(iargs);
    obj.render = renderOverride(obj.render);
    obj.input = input;
    obj.parse = parse;
    return obj;
  }

  /**
   * Override default renderer
   */
  function renderOverride(baseRender) {
    return function (item) {
      var element = baseRender.call(this, item);
      element.attr('data-option-value', item);
      Promise.resolve(this.args.options).then(function (options) {
        var option = options.find(function (o) {
          return o.value === item;
        });
        if (option) {
          element.find('.item-list-text-renderer-value').text(option.text);
        }
      });
      return element;
    };
  }

  /**
   * Render input form
   * @param {Object[]} ratings Default ratings for the select
   * @return {Object} Object to add to DOM
   */
  function input(item) {
    var select = $('<select></select>');
    Promise.resolve(this.args.options).then(function (options) {
      options.forEach(function (option) {
        $('<option></option>').text(option.text).val(option.value).prop('selected', option.value === item).appendTo(select);
      });
    });
    return select;
  }

  /**
   * Get the selected option
   * @param {Object} select DOM element
   * @return {Object[]} Parsed ratings
   */
  function parse(select) {
    return select.val();
  }
  formatters.optionsFormatter = optionsFormatter;
})(controls.itemListFormatters); // eslint-disable-line