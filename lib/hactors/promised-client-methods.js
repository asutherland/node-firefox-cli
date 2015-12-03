'use strict';

var extend = require("firefox-client/lib/extend"),
    ClientMethods = require("firefox-client/lib/client-methods");

module.exports = extend(ClientMethods, {
  promisedRequest: function(name, args) {
    return new Promise((resolve, reject) => {
      this.request(name, args || {}, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
});
