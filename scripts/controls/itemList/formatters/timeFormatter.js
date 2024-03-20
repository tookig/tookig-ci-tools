"use strict";

/* global $ */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {};
(function (formatters) {
  /**
   * A formatter for time fields
   * @param {Object[]} args               Column options
   * @param {boolean} [readOnly=false]    Flag for if the column is read only or editable.
   */
  function timeFormatter(args) {
    var iargs = Object.assign({
      readOnly: false
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
   * @param {string} time Time to render
   * @return {Object} Object to add to DOM
   */
  function render(time) {
    return $('<div/>').text(time.toShortTimeString()).addClass('item-list-time');
  }

  /**
   * Render input form
   * @param {Object} time Default time for the input box
   * @return {Object} Object to add to DOM
   */
  function input(time) {
    if (this.args.readOnly) {
      return this.render(time);
    }
    return $('<input></input>').attr('type', 'text').val(time ? time.toShortTimeString() : '').timepicker({
      timeFormat: 'H:i'
    }).addClass('item-list-time');
  }

  /**
   * Create a new text from a DOM element
   * @param {Object} element DOM element
   * @return {Object} Parsed text
   */
  function parse(element) {
    if (this.args.readOnly) {
      return element.text();
    }
    return element.val();
  }
  formatters.timeFormatter = timeFormatter;
})(controls.itemListFormatters); // eslint-disable-line