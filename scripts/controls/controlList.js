"use strict";

/* global tools */

// Make sure there is a controls object
var controls = controls || {} // eslint-disable-line
;
(function (controls) {
  // ID counter
  var uid = 1;

  // Prototype
  var controlListPrototype = {
    addItem: addItem,
    updateItem: updateItem,
    removeItem: removeItem
  };

  /**
   * Creates a list with controls based on data objects
   *
   * @param  {object}   args                      Control arguments
   * @param  {object}   args.collection           The tools.collection object that the list should get its data objects from
   * @param  {function} args.equals               A function that returns true if two data objects are equal
   * @param  {function} [args.filter]             A function that determines if a data object from the collection should be
   *                                              added to the list. Return true to add, or false not to.
   * @param  {function} [args.sort]               Callback for sorting objects. Default is no sorting.
   * @param  {object}   args.createControl        Callback for creating the control to show the data object. This control needs to have a
   *                                              'update' method that is called when the control should redraw itself.
   * @return {object}                             The created control
   */
  function controlList(args) {
    // Set default options
    var iargs = Object.assign({
      collection: tools.collection(),
      filter: function filter(o) {
        return true;
      },
      sort: function sort(o1, o2) {
        return 0;
      }
    }, args);
    // Create control
    var control = Object.assign(controls.control(iargs), controlListPrototype);
    // Init DOM objects
    create.call(control);
    // Create an internal collection that keeps track of the objects currently
    // in list, and listen for any events on this collection.
    control._items = tools.collection();
    control._items.register('add', function (item) {
      control.addItem(item);
    });
    control._items.register('update', function (item) {
      control.updateItem(item);
    });
    control._items.register('remove', function (item) {
      control.removeItem(item);
    });
    // Listen to the supplied collection, and add or remove from the internal
    // collection as needed.
    iargs.collection.register('add', checkObject.bind(control));
    iargs.collection.register('update', checkObject.bind(control));
    iargs.collection.register('remove', checkObjectRemove.bind(control));
    // Return
    return control;
  }
  function create() {
    this.element.addClass('control-list');
  }
  function checkObject(obj) {
    // Check if object should be displayed in list
    var valid = true;
    if (typeof this.args.filter === 'function') {
      valid = this.args.filter(obj);
    }
    // Check if object is displayed in list already
    var item = this._items.items().find(function (i) {
      return this.args.equals(obj, i.obj);
    }.bind(this));
    // Check if to add, remove or update list
    if (!valid && item) {
      this._items.remove(item);
    } else if (valid && item) {
      item.obj = obj;
      this._items.trigger('update', item);
    } else if (valid && !item) {
      this._items.add({
        obj: obj
      });
    }
  }
  function checkObjectRemove(obj) {
    var valid = true;
    if (typeof this.args.filter === 'function') {
      valid = this.args.filter(obj);
    }
    if (valid) {
      this._items.remove(function (item) {
        return this.args.equals(item.obj, obj);
      }.bind(this));
    }
  }
  function addItem(item) {
    item.control = this.args.createControl(item.obj);
    item.uid = uid++;
    item.control.element.attr('data-uid', item.uid);
    item.control.appendTo(this.element);
    item.control.update(item.obj);
    sortItem.call(this, item);
  }
  function updateItem(item) {
    item.control.update(item.obj);
    sortItem.call(this, item);
  }
  function removeItem(item) {
    item.control.dispose();
  }
  function sortItem(item) {
    if (typeof this.args.sort !== 'function') return;
    var prev = item.control.element.prev();
    if (prev) {
      var _uid = prev.attr('data-uid');
      var found = this._items.items().find(function (i) {
        return i.uid == _uid;
      }); // eslint-disable-line
      if (found && this.args.sort(found.obj, item.obj) > 0) {
        item.control.element.insertBefore(found.control.element);
        return sortItem.call(this, item);
      }
    }
    var next = item.control.element.next();
    if (next) {
      var _uid2 = next.attr('data.uid');
      var _found = this._items.items().find(function (i) {
        return i.uid == _uid2;
      }); // eslint-disable-line
      if (_found && this.args.sort(_found.obj, item.obj) < 0) {
        item.control.element.insertAfter(_found.control.element);
        return sortItem.call(this, item);
      }
    }
  }
  controls.controlList = controlList;
})(controls);