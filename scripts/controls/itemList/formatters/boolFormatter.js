/* global $ */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {}

;(function (formatters) {
  /**
   * A formatter for boolean (or rather binary) data.
   * @param {Object[]} args               Column options
   * @param {boolean} [readOnly=false]    Flag for if the column is read only or editable.
   */
  function boolFormatter (args) {
    const iargs = Object.assign({
      readOnly: false
    }, args)
    // Create formatter object
    let formatter = Object.assign(controls.itemListFormatters.formatter(iargs), {
      input: input,
      parse: parse,
      render: render
    })
    return formatter
  }

  /**
   * Render an item
   * @param {string} item Item to render
   * @return {Object} Object to add to DOM
   */
  function render (item) {
    return $('<input></input>').attr('type', 'checkbox').prop('disabled', true).prop('checked', item)
  }

  /**
   * Render input form
   * @param {Object} item Default setting (1/true or 0/false) for the input
   * @return {Object} Object to add to DOM
   */
  function input (item) {
    return this.render(item).prop('disabled', this.args.readOnly)
  }

  /**
   * Parse the value of the input box
   * @param {Object} element DOM element
   * @return {number} 1 if selected, 0 otherwise
   */
  function parse (element) {
    return element.prop('checked') ? 1 : 0
  }

  formatters.boolFormatter = boolFormatter
})(controls.itemListFormatters)
; // eslint-disable-line
