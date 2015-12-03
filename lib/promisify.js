// from node-firefox-console
exports.promisifyMethods = function(context, methodNames) {
  methodNames.forEach(function(name) {
    var originalMethod = context[name];
    context[name] = function() {
      var mutableArguments = Array.prototype.slice.call(arguments, 0);
      return new Promise(function(resolve, reject) {
        mutableArguments.push(function(err, result) {
          return err ? reject(err) : resolve(result);
        });
        originalMethod.apply(context, mutableArguments);
      });
    };
  });
  return context;
}
