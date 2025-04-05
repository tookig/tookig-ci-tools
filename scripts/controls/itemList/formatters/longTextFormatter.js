"use strict";

/* global $ */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {};
(function (formatters) {
  /**
   * A formatter for longer text based data, using a textarea as input method.
   * @param {Object[]} args               Column options
   */
  function longTextFormatter(args) {
    // Create formatter object
    var formatter = controls.itemListFormatters.textFormatter(args);
    formatter.input = input;
    formatter.parse = parse;
    return formatter;
  }

  /**
   * Render input form (overrides the default text input form)
   * @param {Object} text Item text to use as default input
   * @return {Object} Object to add to DOM
   */
  function input(text) {
    if (this.args.readOnly) {
      return this.render(text);
    }
    return $('<div/>').append($('<span/>').text(this.args.prefix)).append($('<textarea></textarea>').addClass('item-list-long-text').text(text || '')).append($('<span/>').text(this.args.suffix));
  }

  /**
   * Get the textarea value
   * @param {Object} element DOM element
   * @return {Object} Parsed text
   */
  function parse(element) {
    if (this.args.readOnly) {
      return element.find('span.item-list-text-renderer-value').text();
    }
    var text = element.find('textarea').val();
    return this.args.uppercase ? text.toLocaleUpperCase() : text;
  }
  formatters.longTextFormatter = longTextFormatter;
})(controls.itemListFormatters); // eslint-disable-line