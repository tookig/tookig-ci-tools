"use strict";

/* global $ */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {};
(function (formatters) {
  /**
   * A formatter for color data.
   * @param {Object[]} args               Column options
   * @param {boolean} [readOnly=false]    Flag for if the column is read only or editable.
   */
  function colorFormatter(args) {
    var iargs = Object.assign({
      readOnly: false
    }, args);
    // Create formatter object
    var formatter = Object.assign(controls.itemListFormatters.formatter(iargs), {
      input: input,
      parse: parse,
      render: render
    });
    return formatter;
  }

  /**
   * Render an item
   * @param {string} item Item to render
   * @return {Object} Object to add to DOM
   */
  function render(item) {
    return $('<div></div>').addClass('item-list-color').css('background-color', item);
  }

  /**
   * Render input form
   * @param {Object} item Default color for the input
   * @return {Object} Object to add to DOM
   */
  function input(item) {
    var element = $('<input></input>').attr('type', 'text').val(item);
    window.setTimeout(function () {
      element.spectrum({
        clickoutFiresChange: true,
        hideAfterPaletteSelect: false,
        chooseText: 'Välj',
        cancelText: 'Avbryt',
        showInput: true,
        preferredFormat: 'hex',
        showPalette: true,
        disabled: this.args.readOnly,
        palette: [['#00bfff', '#0080ff', '#0040ff', '#0000ff', '#4000ff'], ['#8000ff', '#bf00ff', '#ff00ff', '#ff00bf', '#ff0080'], ['#ff0040', '#ff0000', '#ff2000', '#ff4000', '#ff8000'], ['#ffbf00', '#ffff00', '#bfff00', '#80ff00', '#40ff00'], ['#00ff00', '#00ff40', '#00ff80', '#00ffbf', '#00ffff']],
        change: function change(color) {}
      });
    }.bind(this), 10);
    return element;
  }

  /**
   * Parse the value of the color box
   * @param {Object} element DOM element
   * @return {number} A CSS color value
   */
  function parse(element) {
    return element.val();
  }
  formatters.colorFormatter = colorFormatter;
})(controls.itemListFormatters); // eslint-disable-line