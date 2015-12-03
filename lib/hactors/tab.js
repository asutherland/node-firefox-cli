'use strict';

var extend = require("firefox-client/lib/extend"),
    PromisedClientMethods = require("./promised-client-methods");

var Worker = require('./worker');

/**
 * This is a somewhat redundant variant on firefox-client/lib/promise.  We
 * primarily exist because we wanted a listWorkers method and we can start
 * to hollow out the other one now.
 */
function Tab(client, realTabRep) {
  this.initialize(client, realTabRep.tab.actor);
  this.rawTab = realTabRep.tab;
}
Tab.prototype = extend(PromisedClientMethods, {
  attach: function() {
    return this.promisedRequest('attach');
  },

  detach: function() {
    return this.promisedRequest('detach');
  },

  listWorkers: function() {
    return this.promisedRequest('listWorkers').then((result) => {
      return result.workers.map((rawWorker) => {
        return new Worker(this.client, rawWorker);
      });
    });
  }
});
module.exports = Tab;
