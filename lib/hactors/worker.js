'use strict';

var extend = require("firefox-client/lib/extend"),
    PromisedClientMethods = require("./promised-client-methods");

var Thread = require('./thread');

/**
 * This is a somewhat redundant variant on firefox-client/lib/promise.  We
 * primarily exist because we wanted a listWorkers method and we can start
 * to hollow out the other one now.
 */
function Worker(client, raw) {
  this.initialize(client, raw.actor);
  this.url = raw.url;
  this.workerType = raw.type;
}
Worker.prototype = extend(PromisedClientMethods, {
  attach: function() {
    return this.promisedRequest('attach');
  },

  detach: function() {
    return this.promisedRequest('detach');
  },

  connect: function() {
    return this.promisedRequest('connect').then((result) => {
      return new Thread(this.client, result.threadActor);
    });
  }
});
module.exports = Worker;
