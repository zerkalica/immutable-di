"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _utils = require("../utils");

var classToFactory = _utils.classToFactory;
var getDebugPath = _utils.getDebugPath;

function procesDeps(deps) {
    var resultDeps = [];
    deps = deps || [];
    var isArray = Array.isArray(deps);
    var names = isArray ? [] : Object.keys(deps);
    var len = isArray ? deps.length : names.length;
    for (var i = 0; i < len; i++) {
        var _name = names.length ? names[i] : void 0;
        var dep = deps[_name || i];
        var isPromise = Array.isArray(dep) && dep.length === 2 && typeof dep[1] === "function";
        var isPath = typeof dep === "string";
        var definition = isPromise ? dep[0] : isPath ? null : dep;
        if (definition) {
            GenericAdapter.extractMetaInfo(definition);
        }
        resultDeps.push({
            name: _name,
            promiseHandler: isPromise ? dep[1] || function (p) {
                return p;
            } : null,
            path: isPath ? dep.split(".") : [],
            definition: definition
        });
    }

    return resultDeps;
}

var GenericAdapter = (function () {
    function GenericAdapter() {
        _classCallCheck(this, GenericAdapter);
    }

    _prototypeProperties(GenericAdapter, {
        factory: {
            value: function factory(name, deps, fn) {
                fn = fn || function (state) {
                    return state;
                };
                fn.__factory = [name, deps];

                return fn;
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
                    throw new Error("Getter is not a definition in " + debugPath + ": " + definition);
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
        },
        extractMetaInfo: {

            /**
             *
             * @example
             *
             * definition:
             *
             * ['TestFn', Dep1, Dep2]
             * ['TestFn', Dep1, 'state.path.1']
             * ['TestFn', [Dep1, p => p.catch({})], 'state.path.2']
             * ['TestFn', {dep1: Dep1}]
             * ['TestFn', {dep1: [Dep1, p => p.catch({})]}]
             */

            value: function extractMetaInfo(definition, debugPath) {
                var id = GenericAdapter.idFromDefinition(definition, debugPath);

                if (!definition.__diCached) {
                    (function () {
                        var isClass = definition.__class;
                        var di = isClass ? definition.__class : definition.__factory;
                        var first = di[1];
                        var deps = procesDeps(typeof first === "object" && !Array.isArray(first) ? first : di.slice(1));
                        var waitFor = procesDeps(definition.__waitFor);

                        var scopeSet = new Set();
                        for (var i = 0; i < deps.length; i++) {
                            var dep = deps[i];
                            if (dep.path && dep.path.length) {
                                scopeSet.add(dep.path[0]);
                            } else {
                                var depMeta = GenericAdapter.extractMetaInfo(dep.definition, getDebugPath([debugPath, i]));
                                depMeta.scopes.forEach(function (path) {
                                    return scopeSet.add(path);
                                });
                            }
                        }
                        var scopes = Array.from(scopeSet.values());

                        definition.__diCached = {
                            id: id,
                            name: di[0],
                            handler: isClass ? classToFactory(definition) : definition,
                            scopes: scopes,
                            scope: scopes.length ? scopes[0] : "global",
                            waitFor: waitFor,
                            deps: deps
                        };
                    })();
                }
                return definition.__diCached;
            },
            writable: true,
            configurable: true
        }
    }, {
        updatable: {
            value: function updatable(Widget, _ref) {
                var name = _ref.name;
                var props = _ref.props;
                var state = _ref.state;

                var factory = GenericAdapter.factory;
                var stateDef = factory(name + ".state", state);

                Widget.__di = extractMetaInfo(factory(name + ".element", factory(name, {
                    updater: factory(name + ".updaterProvider", {}, function () {
                        return function (setState) {
                            return factory(name + ".updater", stateDef, function (state) {
                                return setState(state);
                            });
                        };
                    }),
                    props: factory(name + ".props", props),
                    state: stateDef
                })));
            },
            writable: true,
            configurable: true
        }
    });

    return GenericAdapter;
})();

module.exports = GenericAdapter;