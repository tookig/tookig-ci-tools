"use strict";

/* global $ */

// Make sure there is a controls object
var controls = controls || {} // eslint-disable-line
;
(function (controls) {
  controls.activeControls = [];
  function _addToActive(control) {
    if (!controls.activeControls.find(function (c) {
      return c === control;
    })) {
      controls.activeControls.push(control);
    }
  }
  function appendTo(parent) {
    if (!parent) {
      parent = $('body');
    }
    parent.append(this.element);
    _addToActive(this);
    return this;
  }
  function prependTo(parent) {
    if (!parent) {
      parent = $('body');
    }
    parent.prepend(this.element);
    _addToActive(this);
    return this;
  }
  function dispose() {
    var i = controls.activeControls.indexOf(this);
    if (i >= 0) {
      controls.activeControls.splice(i, 1);
    }
    this.element.remove();
  }
  var controlPrototype = {
    appendTo: appendTo,
    prependTo: prependTo,
    dispose: dispose
  };
  function create(args) {
    args = args || {};
    var control = Object.assign({
      element: args.rootElement || $('<div/>'),
      args: args
    }, controlPrototype);
    return control;
  }
  controls.control = create;
})(controls);