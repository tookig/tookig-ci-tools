"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
// Make sure there is a tools object
var tools = tools || {} // eslint-disable-line
;
(function (tools) {
  /**
   * Register to get event notifications
   *
   * @param {string} event Event to listen for. '*' to listen for all events.
   * @param {*} listener
   * @param {*} context
   */
  function register(event, listener, context) {
    if (_typeof(this.events[event]) !== 'object') {
      this.events[event] = [];
    }
    this.events[event].push({
      listener: listener,
      context: context
    });
    return this;
  }
  function unRegister(event, listener) {
    if (_typeof(this.events[event]) !== 'object') {
      return;
    }
    this.events[event] = this.events[event].filter(function (l) {
      return l.listener !== listener;
    });
    return this;
  }
  function trigger(event) {
    var todos = Array.isArray(this.events['*']) ? this.events['*'].slice() : [];
    if (Array.isArray(this.events[event])) {
      todos.push.apply(todos, this.events[event]);
    }
    var listenerArguments = [].slice.call(arguments, 1);
    listenerArguments.push(event);
    todos.forEach(function (todo) {
      todo.listener.apply(todo.context || todo.listener, listenerArguments);
    });
    return this;
  }
  var eventEmitterPrototype = {
    register: register,
    unRegister: unRegister,
    trigger: trigger
  };
  function eventEmitter(args) {
    var obj = Object.assign({
      events: []
    }, eventEmitterPrototype, args);
    return obj;
  }
  tools.eventEmitter = eventEmitter;
})(tools);