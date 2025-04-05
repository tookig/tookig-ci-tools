"use strict";

/* global $ */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line

(function (controls) {
  /**
   * Creates a item list with drag-n-drop functionality.
   *
   * The dragDropLists makes it possible to rearrange items in a itemList. The
   * dragDropList removes default itemList pagination or sorting. When an item
   * has been dragged to a new position, an optional callback function is called.
   *
   * @param {object} args                   - list parameters. See itemList for more options
   * @param {function} [args.dragDrop]      - Callback function for when an item has moved position. Should return true
   *                                          if the move is ok, and false if it should be undone, or a Promise returning
   *                                          true/false.
   */
  function dragDropList(args) {
    // Set default values
    var iargs = Object.assign({
      dragDrop: function dragDrop(item, from, to) {}
    }, args);
    // Edit args and make sure there is no upper limit on how many rows
    // can be present
    iargs.pagination = Object.assign({}, args.pagination, {
      maxCount: Number.MAX_SAFE_INTEGER
    });
    // Make sure no columns are marked as sortable
    iargs.columns.forEach(function (column) {
      column.sortable = false;
    });
    var list = controls.itemList(iargs);
    list.header = headerOverride(list.header);
    list.footer = footerOverride(list.footer);
    list.insert = insertOverride(list.insert);
    list.create = createOverride(list.create);
    return list;
  }
  function headerOverride(header) {
    return function () {
      // Create header in base class
      var tbody = header.call(this);
      // Add an extra column for the grab handle
      $('<th></th>').prependTo(tbody.find('tr').first());
      return this;
    };
  }
  function footerOverride(footer) {
    return function () {
      var tbody = footer.call(this);
      tbody.find('tr').each(function (i, element) {
        var tr = $(element).find('td').first();
        tr.attr('colspan', parseInt(tr.attr('colspan'), 10) + 1);
        tr.find('.item-list-search-text').hide();
      });
      return tbody;
    };
  }
  function insertOverride(insert) {
    return function (item) {
      // Get row
      var tr = insert.call(this, item);
      // Add grip handle
      $('<td></td>').append($('<span></span>').addClass('ui-icon ui-icon-grip-dotted-horizontal')).prependTo(tr);
      return tr;
    };
  }
  function createOverride(create) {
    return function () {
      create.call(this);
      this.element.find('tbody.item-list-items').sortable({
        start: startDragDrop.bind(this),
        stop: endDragDrop.bind(this)
      });
      return this;
    };
  }
  function startDragDrop(event, ui) {
    this._dragFrom = ui.item.index();
  }
  function endDragDrop(event, ui) {
    Promise.resolve(this.args.dragDrop(this.getItemFromIID(parseInt(ui.item.attr('data-iid'), 10)), this._dragFrom, ui.item.index())).then(function (success) {
      // Lazy here, just reloading
      this.load();
    }.bind(this));
  }
  controls.dragDropList = dragDropList;
})(controls); // eslint-disable-line