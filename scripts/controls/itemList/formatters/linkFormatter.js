"use strict";

/* global $ */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {};
(function (formatters) {
  /**
   * A formatter for text based data that can be used as a link
   * @param {Object[]} args               Column options
   * @param {function} args.getText       Callback for getting the text assosiacted with an item
   * @param {function} args.getUrl        Callback for getting the url for the link for an item
   */
  function linkFormatter(args) {
    // Create formatter object
    var formatter = controls.itemListFormatters.textFormatter(args);
    formatter.render = render.call(formatter, formatter.render);
    formatter.input = input.call(formatter, formatter.input);
    return formatter;
  }

  /**
   * Render an item (overrides the default text renderer)
   * @param {Object} item Item to render
   * @param {string} item.text Text to show
   * @param {string} item.url URL for the link
   * @return {Object} Object to add to DOM
   */
  function render(baseRender) {
    return function (item, obj) {
      var div = baseRender.call(this, this.args.getText(item, obj));
      return $('<a></a>').attr('href', this.args.getUrl(item, obj)).append(div);
    }.bind(this);
  }

  /**
   * Render input form (overrides the default text input form)
   * @param {Object} item Item to render
   * @param {object} item.text Default text for the input box
   * @return {Object} Object to add to DOM
   */
  function input(baseInput) {
    return function (item, obj) {
      return baseInput.call(this, item ? this.args.getText(item, obj) : '');
    }.bind(this);
  }
  formatters.linkFormatter = linkFormatter;
})(controls.itemListFormatters); // eslint-disable-line