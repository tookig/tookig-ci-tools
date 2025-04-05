"use strict";

/* global $ */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {};
(function (formatters) {
  /**
   * A formatter for text based data
   * @param {Object[]} args               Column options
   * @param {boolean} [readonly=false]    Flag for if the column is read only or editable.
   * @param {boolean} [uppercase=false]   Make everything (both input and output) uppercase.
   * @param {string} [prefix='']          Text to show before each item
   * @param {string} [suffix='']          Text to show after each item
   */
  function textFormatter(args) {
    var iargs = Object.assign({
      readonly: false,
      uppercase: false,
      prefix: '',
      suffix: ''
    }, args);
    // Create formatter object
    var obj = Object.assign(controls.itemListFormatters.formatter(iargs), {
      input: input,
      parse: parse,
      render: render
    });
    return obj;
  }

  /**
   * Render an item
   * @param {string} item Text to render
   * @return {Object} Object to add to DOM
   */
  function render(item) {
    return $('<div/>').append($('<span/>').text(this.args.prefix).addClass('item-list-text-renderer-prefix')).append($('<span/>').text(this.args.uppercase ? item.toLocaleUpperCase() : item).addClass('item-list-text-renderer-value')).append($('<span/>').text(this.args.suffix).addClass('item-list-text-renderer-suffix'));
  }

  /**
   * Render input form
   * @param {Object} text Default text for the input box
   * @return {Object} Object to add to DOM
   */
  function input(text) {
    if (this.args.readonly) {
      return this.render(text);
    }
    return $('<div/>').append($('<span/>').text(this.args.prefix)).append($('<input></input>').attr('type', 'text').val(text || '')).append($('<span/>').text(this.args.suffix));
  }

  /**
   * Create a new text from a DOM element
   * @param {Object} element DOM element
   * @return {Object} Parsed text
   */
  function parse(element) {
    element = $(element);
    if (this.args.readonly) {
      return element.find('span.item-list-text-renderer-value').text();
    }
    var text = element.find('input').val();
    return this.args.uppercase ? text.toLocaleUpperCase() : text;
  }
  formatters.textFormatter = textFormatter;
})(controls.itemListFormatters); // eslint-disable-line