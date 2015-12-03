'use strict';

var extend = require("firefox-client/lib/extend"),
    PromisedClientMethods = require("./promised-client-methods");

function Thread(client, threadActor) {
  this.initialize(client, threadActor);
}
Thread.prototype = extend(PromisedClientMethods, {
  attach: function() {
    return this.promisedRequest('attach');
  },

  detach: function() {
    return this.promisedRequest('detach');
  },
});
module.exports = Thread;
