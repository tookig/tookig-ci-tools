"use strict";

// Make sure there is a tools object
var tools = tools || {} // eslint-disable-line

/**
 * Creates an object tools.sharedData on which data that is shared betweeen
 * different objects can be shared. Each item store has a name, and a collection
 * of items. The collection is of type tools.collection, and can have events
 * attached to it, see tools.eventEmitter.
 *
 * To access a collection, use the function get, with the collection name as
 * parameter. If no store with this name is available, one is created.
 */
;

(function (tools) {
  var data = [];

  function _create(name) {
    var collection = tools.collection();
    data.push({
      name: name,
      collection: collection
    });
    return collection;
  }

  function get(name) {
    var item = data.find(function (i) {
      return i.name === name;
    });
    return item ? item.collection : _create(name);
  }

  function init() {
    return {
      get: get
    };
  }

  tools.sharedData = init();
})(tools);