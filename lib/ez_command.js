/**
 * Brief experimental first step at a more convenient command.  I'm not
 * proposing this as a direction for node-firefox-*.  My thoughts thus far are
 * that:
 * - using generators a la co.wrap is nice, but you don't need this file to
 *   do that, just co.wrap or another task driver.
 * - many commands are going to want a connection.  It makes sense to reduce
 *   this to at most a single command, and arguably it could make sense for
 *   the commands to merely indicate they want a connection and have the support
 *   code (like this file) take care of that.
 * - it's nice if things auto-exit/cleanup upon resolving the command.
 * - (not specific to this file) the underlying firefox-client stuff needs to
 *   be promise-wrapped, but I stole node-firefox-console's promisifyMethods
 *   implementation and put it in ./promisify.  (I think Q's more explicit
 *   every-time stopgap wrapping might be more intuitive, really.)
 **/

var co = require('co');
var common = require('./common');
var firefox = require('node-firefox');

var promisifyMethods

var connectSingleClient = co.wrap(function*(options) {
  // If a port is specified, don't bother trying to find ports, just use it.
  if (options.ports && options.ports.length) {
    return firefox.connect(options.ports[0]);
  }

  var selectedPorts = yield common.selectPorts(options.ports);
  if (selectedPorts.length === 0) {
    throw new Error('No listening ports found.');
  }

  return firefox.connect(selectedPorts[0].port);
});

var runCommand = co.wrap(function*(def) {
  var actualArgs = Array.from(arguments).slice(1);
  var options = actualArgs.slice(-1)[0];
  var useArgs = actualArgs.slice();

  if (def.connections === 'one') {
    var conn = yield connectSingleClient(options);
    useArgs.unshift(conn);
  }

  var errorCode = yield def.command.apply(null, useArgs);

  process.exit(errorCode);
});

module.exports = function(def) {
  return function(program, init) {
    var prog = program.command(def.name)
      .description(def.description);

    if (def.connections) {
      prog.option('-p, --ports <port, port, ...>',
        'specify debugging ports for runtimes', common.intList);
    }

    prog.action(init(runCommand.bind(null, def)));
  };
};
