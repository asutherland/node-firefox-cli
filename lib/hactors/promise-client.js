'use strict';

var extend = require("firefox-client/lib/extend"),
    PromisedClientMethods = require("./promised-client-methods");

/**
 * The back-end actually implements this as an ObjectClient.
 */
function PromiseClient(client, promiseObj) {
  this.initialize(client, promiseObj.actor);
}
PromiseClient.prototype = extend(PromisedClientMethods, {
  getAllocationStack: function() {
    return this.promisedRequest('allocationStack');
  },

  getDependentPromises: function() {
    return this.promisedRequest('dependentPromises');
  }
});
module.exports = PromiseClient;
