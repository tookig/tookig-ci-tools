"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
// Make sure there is a factory object
var factory = factory || {}; // eslint-disable-line

(function (factory) {
  var toLocalISODateString = function toLocalISODateString() {
    return this.getFullYear() + '-' + ('00' + (this.getMonth() + 1)).slice(-2) + '-' + ('00' + this.getDate()).slice(-2);
  };

  // http://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime
  var toLocalMySQLString = function toLocalMySQLString() {
    return this.getFullYear() + '-' + ('00' + (this.getMonth() + 1)).slice(-2) + '-' + ('00' + this.getDate()).slice(-2) + ' ' + ('00' + this.getHours()).slice(-2) + ':' + ('00' + this.getMinutes()).slice(-2) + ':' + ('00' + this.getSeconds()).slice(-2);
  };
  var toTimeString = function toTimeString() {
    return ('00' + this.getHours()).slice(-2) + ':' + ('00' + this.getMinutes()).slice(-2) + ':' + ('00' + this.getSeconds()).slice(-2);
  };
  var toShortTimeString = function toShortTimeString() {
    return ('00' + this.getHours()).slice(-2) + ':' + ('00' + this.getMinutes()).slice(-2);
  };
  var compare = function compare(other) {
    if (this === other || isNaN(this.getTime()) && isNaN(other.getTime())) {
      return 0;
    }
    if (!this || isNaN(this.getTime())) {
      return 1;
    }
    if (!other || isNaN(other.getTime())) {
      return -1;
    }
    return this.getTime() - other.getTime();
  };
  var equals = function equals(other) {
    return this.compare(other) === 0;
  };
  var clone = function clone() {
    return factory.date.fromTimestamp(this.getTime());
  };
  function addDays(days) {
    this.setDate(this.getDate() + days);
    return this;
  }
  var datePrototype = {
    toLocalISODateString: toLocalISODateString,
    toLocalMySQLString: toLocalMySQLString,
    toTimeString: toTimeString,
    toShortTimeString: toShortTimeString,
    compare: compare,
    equals: equals,
    clone: clone,
    addDays: addDays
  };
  var fromDate = function fromDate(sourceDate) {
    return Object.assign(new Date(sourceDate.getTime()), datePrototype);
  };
  var now = function now() {
    return fromDate(new Date());
  };
  var fromMySQL = function fromMySQL(str) {
    if (!str || str.length !== 19) {
      return fromDate(new Date('foo'));
    }
    var a = str.split(' ');
    if (a.length !== 2) {
      return fromDate(new Date('foo'));
    }
    var d = a[0].split('-');
    if (d.length !== 3) {
      return fromDate(new Date('foo'));
    }
    var t = a[1].split(':');
    if (t.length !== 3) {
      return fromDate(new Date('foo'));
    }
    return fromDate(new Date(d[0], d[1] - 1, d[2], t[0], t[1], t[2]));
  };
  var fromISODate = function fromISODate(str) {
    if (!str || str.length !== 10) {
      return fromDate(new Date('foo'));
    }
    var d = str.split('-');
    if (d.length !== 3) {
      return fromDate(new Date('foo'));
    }
    return fromDate(new Date(d[0], d[1] - 1, d[2]));
  };
  var fromISOTime = function fromISOTime(str) {
    if (!str || str.length !== 8) {
      return fromDate(new Date('foo'));
    }
    var d = str.split(':');
    if (d.length !== 3) {
      return fromDate(new Date('foo'));
    }
    var date = now();
    date.setHours(d[0], d[1], d[2]);
    return date;
  };
  var isValidDate = function isDate(obj) {
    return obj !== null && _typeof(obj) === 'object' && typeof obj.getTime === 'function' && !isNaN(obj.getTime());
  };
  var fromTimestamp = function fromTimestamp(timestamp) {
    return fromDate(new Date(timestamp));
  };
  factory.datePrototype = datePrototype;
  factory.date = {
    fromDate: fromDate,
    now: now,
    fromMySQL: fromMySQL,
    fromISODate: fromISODate,
    fromTimestamp: fromTimestamp,
    fromISOTime: fromISOTime,
    isValidDate: isValidDate
  };
})(factory);