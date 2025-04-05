"use strict";

// Make sure there is a tools object
var tools = tools || {} // eslint-disable-line
;
(function (tools) {
  /**
   * Find difference between two arrays.
   * @param  {object[]} array1
   * @param  {object[]} array2
   * @return {object[]} All items in array1 that is not present in array2
   */
  function diff(array1, array2) {
    return array1.filter(function (item1) {
      return !array2.find(function (item2) {
        return item1 === item2;
      });
    });
  }
  tools.array = {
    diff: diff
  };
})(tools); // eslint-disable-line