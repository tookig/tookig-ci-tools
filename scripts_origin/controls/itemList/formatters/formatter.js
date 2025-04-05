// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {}

;(function (formatters) {
  /**
   * Base object for column formatters
   * @param {Object[]} args               Column options
   */
  function formatter (args) {
    const iargs = Object.assign({}, args)
    // Create formatter object
    let obj = {
      args: iargs,
      input: input,
      parse: parse,
      render: render
    }
    return obj
  }

  /**
   * Render an item
   * @param {Object} item Item to render
   * @param {Object} source The source object the item belongs to
   * @return {Object} Object to add to DOM
   */
  function render (item, source) {
    return ''
  }

  /**
   * Render an input form for an item
   * @param {Object} item Item to render input for, or nothing if new item
   * @param {Object} source The source object the item belongs to 
   * @return {Object} Object to add to DOM
   */
  function input (item, source) {
    return ''
  }

  /**
   * Create a new item from a DOM element
   * @param {Object} element DOM element
   * @return {Object} Parsed item
   */
  function parse (element) {
    return undefined
  }

  formatters.formatter = formatter
})(controls.itemListFormatters)
; // eslint-disable-line
