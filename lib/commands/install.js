var Promise = require('es6-promise').Promise;
var fs = require('fs');
var common = require('../common');

var findPorts = require('node-firefox-find-ports');
var connect = require('node-firefox-connect');
var installApp = require('node-firefox-install-app');
var findApp = require('node-firefox-find-app');
var uninstallApp = require('node-firefox-uninstall-app');
var launchApp = require('node-firefox-launch-app');

module.exports = function(program, init) {
  program.command('install <appPath>')
    .description('Install a webapp')
    .option('-n, --nodelete',
        'do not delete existing apps before installation')
    .option('-l, --launch',
        'launch app after installation')
    .option('-p, --ports <port, port, ...>',
        'specify debugging ports for runtimes', common.intList)
    .action(init(cmd));
};

function cmd(appPath, options) {

  common.selectPorts(options.ports).then(function (selectedPorts) {
    if (selectedPorts.length === 0) {
      throw new Error('No ports available for install');
    }
    return Promise.all(selectedPorts.map(function(port) {
      return install(options, port, appPath);
    }));
  }).then(function(results) {

    if (options.parent.verbose) {
      results.forEach(function(result) {
        console.log('App ID', result.appId, 'installed to port', result.port.port);
      });
    } else if (!options.parent.quiet) {
      console.log(results);
    }

  }).catch(console.error);

}

function install(options, port, appPath) {
  var manifest = JSON.parse(fs.readFileSync(appPath + '/manifest.webapp'));
  var client, appId;
  return connect(port.port).then(function(result) {
    client = result;
    return options.nodelete ? false : uninstall(client, manifest);
  }).then(function(result) {
    return installApp({ client: client, appPath: appPath });
  }).then(function(result) {
    appId = result;
    return options.launch ? launch(client, manifest) : false;
  }).then(function(result) {
    return client.disconnect();
  }).then(function(result) {
    return { port: port, appId: appId };
  });
}

function uninstall(client, manifest) {
  return findApp({ client: client, manifest: manifest }).then(function(apps) {
    return Promise.all(apps.map(function(app) {
      return uninstallApp({ client: client, manifestURL: app.manifestURL });
    }));
  });
}

function launch(client, manifest) {
  return findApp({ client: client, manifest: manifest }).then(function(apps) {
    if (apps.length === 0) { return false; }
    return launchApp({ client: client, manifestURL: apps[0].manifestURL });
  });
}