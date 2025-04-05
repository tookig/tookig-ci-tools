"use strict";

/* global $ */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {};
(function (formatters) {
  /**
   * A formatter for grid style selection
   * @param {Object[]} args                     Column options
   * @param {boolean}  [args.readOnly=false]    Flag for if the column is read only or editable.
   * @param {boolean}  [args.multiselectable=true]  Flag for if more then one option can be picked
   * @param {object[]} args.options             List with available options to choose from, or a Promise returning a list.
   * @param {function} [args.getText]             A function that given an item, returns the text to be shown in the list.
   * @param {function} [args.getValue]            A function that given an item, returns the associated value for the item.
   */
  function gridFormatter(args) {
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
    var ul = $('<ul></ul>').addClass('item-list-grid');
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
    var ul = $('<ul></ul>').addClass('item-list-grid-edit');
    Promise.resolve(this.args.options).then(function (options) {
      if (Array.isArray(options)) {
        options.forEach(function (option) {
          $('<li/>').text(option.text).attr('data-value', option.value).addClass('ui-state-default').appendTo(ul);
        });
      }
      if (this.args.multiselectable) {
        if (Array.isArray(items)) {
          items.forEach(function (item) {
            ul.find('li[data-value=\'' + (typeof this.args.getValue === 'function' ? this.args.getValue(item) : item) + '\']').addClass('ui-selected');
          }.bind(this));
        }
        ul.multiselectable();
      } else if (!this.args.multiselectable) {
        if (items) {
          ul.find('li[data-value=\'' + (typeof this.args.getValue === 'function' ? this.args.getValue(items) : items) + '\']').addClass('ui-selected');
        }
        ul.selectable();
      }
    }.bind(this));
    return ul;
  }

  /**
   * Create a value array from a DOM element
   * @param {Object} ul DOM element
   * @return {Object[]} Selected values
   */
  function parse(ul) {
    if (!this.args.multiselectable) {
      var li = ul.find('li.ui-selected').first();
      return li.length === 1 ? li.attr('data-value') : undefined;
    }
    return ul.find('li.ui-selected').map(function (i, li) {
      return $(li).attr('data-value');
    }).get();
  }
  formatters.gridFormatter = gridFormatter;
})(controls.itemListFormatters); // eslint-disable-line