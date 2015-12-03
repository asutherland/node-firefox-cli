'use strict';

var ezCommand = require('../ez_command');
var co = require('co');

var promisifyMethods = require('../promisify').promisifyMethods;

module.exports = ezCommand({
  name: 'tabs',
  description: 'List Tabs',
  connections: 'one',

  command: co.wrap(function*(rawClient, options) {
    var client = promisifyMethods(rawClient, ['listTabs']);

    var tabs = yield client.listTabs();
    for (var tabRep of tabs) {
      console.log('*', tabRep.tab.url);
      console.log(' ', tabRep.tab.title);
    }
  })
});
