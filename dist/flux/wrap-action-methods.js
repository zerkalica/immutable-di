"use strict";

module.exports = wrapActionMethods;
function methodToConst(methodName) {
  return methodName;
}

function constToMethod(methodName) {
  return methodName;
}

function wrapActionMethods(Actions) {
  if (Actions.__wrapped__) {
    return;
  }

  var obj = Actions.prototype;
  var keys = Object.keys(obj);

  for (var i = 0, l = keys.length; i < l; ++i) {
    (function (i, l) {
      var methodName = keys[i];
      var fn = obj[methodName];
      var key = methodToConst(methodName);
      obj[methodName] = function (key) {
        return (function (a1, a2, a3, a4, a5) {
          var result = fn(a1, a2, a3, a4, a5);
          if (result !== void 0) {
            this.dispatch(key, result);
          }
        })(key);
      };
    })(i, l);
  }
  Actions.__wrapped__ = true;
}