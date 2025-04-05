"use strict";

/* global $ */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {};
(function (formatters) {
  /**
   * A formatter for passwords
   * @param {Object[]} args               Column options
   * @param {boolean} [readOnly=false]    Flag for if the column is read only or editable.
   */
  function passwordFormatter(args) {
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
   * Render a password
   * @return {Object} Object to add to DOM
   */
  function render() {
    return '********';
  }

  /**
   * Render input form
   * @return {Object} Object to add to DOM
   */
  function input() {
    if (this.args.readOnly) {
      return this.render();
    }
    return $('<div/>').append($('<input></input>').attr('name', 'pwd1').attr('type', 'password')).append($('<input></input>').attr('name', 'pwd2').attr('type', 'password'));
  }

  /**
   * Create a new text from a DOM element
   * @param {Object} element DOM element
   * @return {Object} Parsed text
   */
  function parse(element) {
    if (this.args.readOnly) {
      return undefined;
    }
    var pwd1 = element.find('input[name=\'pwd1\']').val();
    var pwd2 = element.find('input[name=\'pwd2\']').val();
    if ((pwd1 || pwd2) && pwd1 !== pwd2) {
      throw new Error('Passwords do not match');
    }
    return pwd1 || undefined;
  }
  formatters.passwordFormatter = passwordFormatter;
})(controls.itemListFormatters); // eslint-disable-line