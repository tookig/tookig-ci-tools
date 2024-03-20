"use strict";

/* global $ */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line
controls.itemListFormatters = controls.itemListFormatters || {};
(function (formatters) {
  /**
   * A formatter for images.
   * @param {Object[]} args               Column options
   * @param {boolean} [readOnly=false]    Flag for if the column is read only or editable.
   */
  function imageFormatter(args) {
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
   * @param {string} image Image to render
   * @param {string} image.url Image source URL
   * @return {Object} Object to add to DOM
   */
  function render(image) {
    if (image) {
      return $('<img></img>').addClass('item-list-image').attr('src', image);
    }
    return null;
  }

  /**
   * Render input form
   * @param {Object} image Current image
   * @return {Object} Object to add to DOM
   */
  var imageI = 1;
  function input(image) {
    var element = $('<div></div>');
    if (!image) {
      element.append($('<input></input>').attr('type', 'file').attr('name', 'image-' + imageI++));
    } else {
      element.append($('<img></img>').addClass('item-list-image').attr('src', image));
      element.append($('<button></button>').button({
        icon: 'ui-icon-trash'
      }).click(function () {
        element.attr('data-image-status', 'delete');
        element.empty().append($('<input></input>').attr('type', 'file'));
      }));
    }
    return element;
  }

  /**
   * Parse the value of the color box
   * @param {Object} element DOM element
   * @return {number} A file if selected, boolean false if image should be deleted, undefined if to make no change
   */
  function parse(element) {
    var file = element.find('input[type="file"]').first();
    var doDelete = element.attr('data-image-status') === 'delete';
    if (file.val()) {
      return file[0].files[0];
    } else if (doDelete) {
      return false;
    }
    return undefined;
  }
  formatters.imageFormatter = imageFormatter;
})(controls.itemListFormatters); // eslint-disable-line