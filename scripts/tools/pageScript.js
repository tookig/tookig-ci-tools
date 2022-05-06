"use strict";

// Make sure there is a tools object
var tools = tools || {} // eslint-disable-line
;

(function (tools) {
  function inject(key) {
    var form = document.getElementById('page-script-injections');
    var val = form.querySelector('input[name=\'' + key + '\']').value;
    return JSON.parse(val);
  }

  function init() {
    return {
      inject: inject
    };
  }

  tools.pageScript = init();
})(tools);