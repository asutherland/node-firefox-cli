'use strict';

var extend = require("firefox-client/lib/extend"),
    PromisedClientMethods = require("./promised-client-methods");

function Promises(client, fromTab) {
  this.initialize(client, fromTab.promisesActor);
}
Promises.prototype = extend(PromisedClientMethods, {
  attach: function() {
    return this.promisedRequest('attach');
  },

  detach: function() {
    return this.promisedRequest('detach');
  },

  listPromises: function() {
    return this.promisedRequest('listPromises');
  }
});
module.exports = Promises;
