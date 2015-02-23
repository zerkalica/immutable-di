"use strict";

var classToFactory = require("../utils").classToFactory;

function procesDeps(deps) {
    var resultDeps = [];
    deps = deps || [];
    for (var i = 0; i < deps.length; i++) {
        var dep = deps[i];
        var isArray = Array.isArray(dep);
        var isPromise = isArray && dep.length === 2 && typeof dep[1] === "function";
        var isPath = isArray && !isPromise;
        var definition = {
            promiseHandler: isPromise ? dep[1] || function (p) {
                return p;
            } : null,
            path: isPath ? dep : [],
            definition: isPromise ? dep[0] : isPath ? null : dep };

        resultDeps.push(definition);
    }

    return resultDeps;
}

var GenericAdapter = (function () {
    function GenericAdapter() {
        babelHelpers.classCallCheck(this, GenericAdapter);
    }

    babelHelpers.prototypeProperties(GenericAdapter, {
        extractMetaInfo: {
            value: function extractMetaInfo(definition, debugPath) {
                var id = GenericAdapter.idFromDefinition(definition, debugPath);
                var isClass = definition.__class;
                var di = isClass ? definition.__class : definition.__factory;
                var deps = procesDeps(di.slice(1));
                var waitFor = procesDeps(definition.__waitFor);

                return {
                    id: id,
                    handler: isClass ? classToFactory(definition) : definition,
                    name: di[0],
                    waitFor: waitFor,
                    deps: deps
                };
            },
            writable: true,
            configurable: true
        },
        idFromDefinition: {
            value: function idFromDefinition(definition, debugPath) {
                if (typeof definition !== "function") {
                    if (!debugPath) {
                        debugPath = "arg";
                    }
                    throw new Error("Getter is not a definition in " + debugPath);
                }

                if (definition && !debugPath) {
                    debugPath = definition.toString();
                }

                var di = definition.__factory || definition.__class;

                if (!di) {
                    throw new Error("Property .__factory or .__class not exist in " + debugPath);
                }
                if (!Array.isArray(di)) {
                    throw new Error("Property .__factory or .__class is not an array in " + debugPath);
                }

                return di[0];
            },
            writable: true,
            configurable: true
        }
    });
    return GenericAdapter;
})();

module.exports = GenericAdapter;