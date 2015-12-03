'use strict';

var ezCommand = require('../ez_command');
var co = require('co');

var promisifyMethods = require('../promisify').promisifyMethods;

var Promises = require('../hactors/promises');
var PromiseClient = require('../hactors/promise-client');
var Tab = require('../hactors/tab');

module.exports = ezCommand({
  name: 'promises <urlFilter>',
  description: 'List outstanding promises in tab with',
  connections: 'one',

  command: co.wrap(function*(rawClient, urlFilter, options) {
    var client = promisifyMethods(rawClient, ['listTabs']);

    var filter = new RegExp(urlFilter, 'g');

    var tabs = yield client.listTabs();
    for (var tabRep of tabs) {
      if (!filter.test(tabRep.tab.url)) {
        continue;
      }

      var tab = new Tab(tabRep.client, tabRep);
      // We need to attach to the tab to cause a thread actor to come into
      // being which is needed for sources() to work so we can get call stacks.
      tab.attach();

      console.log('===== matching tab', tabRep.tab.url);

      console.log('=== main page');
      var promiseActor = new Promises(tabRep.client, tabRep.tab);

      yield promiseActor.attach();

      var promises = yield promiseActor.listPromises();
      for (var promise of promises.promises) {
        // For pending promises, print what they're waiting on
        if (promise.promiseState.state === 'pending') {
          console.log('= Unresolved promise:');
          var promiseClient = new PromiseClient(tabRep.client, promise);
          var stack = yield promiseClient.getAllocationStack();
          for (var frame of stack.allocationStack) {
            console.log('  ', frame.functionDisplayName, frame.source.url,
                        frame.line + ':' + frame.column);
          }
        }
      }

      var workers = yield tab.listWorkers();
      for (var worker of workers) {
        console.log('=== worker', worker.url);
        console.log('no backend support');
        // Okay, after all that, it seems like there's no way to cause a
        // PromisesActor to be created against the thread right now without
        // changing Gecko.  Which might not be so bad, but it's bedtime.
        /*
        var workerDeets = yield worker.attach();
        console.log('deets', workerDeets);
        yield worker.detach();
        */
      }
    }
  })
});
