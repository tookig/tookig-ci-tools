"use strict";

/* global $ */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {};
(function (formatters) {
  /**
   * A formatter for selectator style selection
   * @param {Object[]} args                     Column options
   * @param {boolean}  [args.readOnly=false]    Flag for if the column is read only or editable.
   * @param {boolean}  [args.multiselectable=true]  Flag for if more then one option can be picked
   * @param {object[]} args.options             List with available options to choose from, or a Promise returning a list.
   * @param {function} [args.getText]             A function that given an item, returns the text to be shown in the list.
   * @param {function} [args.getValue]            A function that given an item, returns the associated value for the item.
   */
  function selectatorFormatter(args) {
    var iargs = Object.assign({
      multiselectable: true,
      readOnly: false,
      options: []
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
   * Render the selected values
   * @param {object[]} items Items to render
   * @return {Object} Object to add to DOM
   */
  function render(items) {
    var ul = $('<ul></ul>').addClass('item-list-selectator');
    if (this.args.multiselectable) {
      if (Array.isArray(items)) {
        items.forEach(function (item) {
          $('<li></li>').text(typeof this.args.getText === 'function' ? this.args.getText(item) : item).attr('data-value', typeof this.args.getValue === 'function' ? this.args.getValue(item) : item).appendTo(ul);
        }.bind(this));
      }
    } else {
      $('<li></li>').text(typeof this.args.getText === 'function' ? this.args.getText(items) : items).attr('data-value', typeof this.args.getValue === 'function' ? this.args.getValue(items) : items).appendTo(ul);
    }
    return ul;
  }

  /**
   * Render input form
   * @param {Object[]} items Selected items
   * @return {Object} Object to add to DOM
   */
  function input(items) {
    if (this.args.readOnly) {
      return this.render(items);
    }
    var select = $('<select/>').prop('multiple', this.args.multiselectable);
    Promise.resolve(this.args.options).then(function (options) {
      if (Array.isArray(options)) {
        options.forEach(function (option) {
          $('<option/>').text(option.text).val(option.value).appendTo(select);
        });
      }
      if (this.args.multiselectable) {
        if (Array.isArray(items)) {
          items.forEach(function (item) {
            select.find('option[value=\'' + (typeof this.args.getValue === 'function' ? this.args.getValue(item) : item) + '\']').prop('selected', true);
          }.bind(this));
        }
      } else if (items) {
        select.find('option[value=\'' + (typeof this.args.getValue === 'function' ? this.args.getValue(items) : items) + '\']').prop('selected', true);
      }
      select.selectator({
        keepOpen: true,
        useSearch: false
      });
    }.bind(this));
    return select;
  }

  /**
   * Create a value array from a DOM element
   * @param {Object} select DOM element
   * @return {Object[]} Selected values
   */
  function parse(select) {
    if (!this.args.multiselectable) {
      var option = select.find('option:checked').first();
      return option.length === 1 ? option.val() : undefined;
    }
    return select.find('option:checked').map(function (i, option) {
      return $(option).val();
    }).get();
  }
  formatters.selectatorFormatter = selectatorFormatter;
})(controls.itemListFormatters); // eslint-disable-line