/* global $, factory */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {}

;(function (formatters) {
  /**
   * A formatter for date and time fields
   * @param {Object[]} args               Column options
   * @param {boolean} [args.readOnly=false]    Flag for if the column is read only or editable. ONLY REDAONLY FOR NOW
   */
  function dateFormatter (args) {
    const iargs = Object.assign({
      readOnly: false
    }, args)
    // Create formatter object
    let obj = Object.assign(controls.itemListFormatters.formatter(iargs), {
      input: input,
      parse: parse,
      render: render
    })
    return obj
  }

  /**
   * Render an item
   * @param {string} date Date to render
   * @return {Object} Object to add to DOM
   */
  function render (date) {
    if (factory.date.isValidDate(date)) {
      return $('<div/>').text(date.toLocalISODateString()).addClass('item-list-date')
    }
    return ''
  }

  /**
   * Render input form
   * @param {Object} date Default date for the input box
   * @return {Object} Object to add to DOM
   */
  function input (date) {
    if (this.args.readOnly) {
      return this.render(date)
    }
    return $('<input></input>').addClass('item-list-date').attr('type', 'text').val(date ? date.toLocalISODateString() : '').datepicker({
      dateFormat: 'yy-mm-dd'
    }).addClass('item-list-time')
  }

  /**
   * Create a new text from a DOM element
   * @param {Object} element DOM element
   * @return {Object} Parsed text
   */
  function parse (element) {
    if (this.args.readOnly) {
      return element.text()
    }
    return element.val()
  }

  formatters.dateFormatter = dateFormatter
})(controls.itemListFormatters)
; // eslint-disable-line
