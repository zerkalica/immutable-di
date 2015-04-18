"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Listeners = _interopRequire(require("./flux/listeners"));

var classToFactory = require("./utils").classToFactory;

function pass(p) {
    return p;
}

function processDeps(deps) {
    var resultDeps = [];
    deps = deps || [];
    var isArray = Array.isArray(deps);
    var names = isArray ? [] : Object.keys(deps);
    var len = isArray ? deps.length : names.length;
    for (var i = 0; i < len; i++) {
        var _name = names.length ? names[i] : undefined;
        var dep = deps[_name || i];
        var isPromise = Array.isArray(dep) && dep.length === 2 && typeof dep[1] === "function";
        var isPath = typeof dep === "string";
        var path = isPath ? null : dep;
        var definition = isPromise ? dep[0] : path;
        resultDeps.push({
            name: _name,
            promiseHandler: isPromise ? dep[1] || pass : null,
            path: isPath ? dep.split(".") : null,
            definition: definition
        });
    }

    return resultDeps;
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var FN_MAGIC = "function";
function getFunctionName(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, "");
    return fnStr.slice(fnStr.indexOf(FN_MAGIC) + FN_MAGIC.length + 1, fnStr.indexOf("("));
}

function getScopes(normalizedDeps, scopeSet) {
    for (var i = 0; i < normalizedDeps.length; i++) {
        var dep = normalizedDeps[i];
        if (dep.path && dep.path.length) {
            scopeSet.add(dep.path[0]);
        } else {
            getScopes(getDef(dep).deps, scopeSet);
        }
    }
}

var ids = new Set();
function getId(Service) {
    var id = getFunctionName(Service);
    if (ids.has(id)) {
        throw new Error("Already registered service with id: " + id);
    }
    ids.add(id);

    return id;
}

function getDef(Service) {
    return Service.__di;
}

function Def(_ref) {
    var id = _ref.id;
    var handler = _ref.handler;
    var deps = _ref.deps;

    var normalizedDeps = processDeps(deps);
    var scopeSet = new Set();
    getScopes(normalizedDeps, scopeSet);
    var scopes = Array.from(scopeSet.values());

    return {
        id: id,
        handler: handler,
        scope: scopes.length ? scopes[0] : "global",
        deps: normalizedDeps
    };
}

function Class(Service, deps) {
    return Def({
        id: getId(Service),
        handler: classToFactory(Service),
        deps: deps || {}
    });
}

function Factory(Service, deps) {
    return Def({
        id: getId(Service),
        handler: Service,
        deps: deps || {}
    });
}

function WaitFor(Service, deps) {
    return processDeps(deps);
}

function passthru(options) {
    return options;
}

function State(Service, _ref) {
    var props = _ref.props;
    var state = _ref.state;

    var id = getId(Service);
    var propsDef = function (p) {
        return p;
    };
    var stateDef = function (p) {
        return p;
    };
    stateDef.__di = Def({
        id: id + ".state",
        deps: state,
        handler: passthru
    });
    propsDef.__di = Def({
        id: id + ".props",
        deps: props,
        handler: passthru
    });

    var diGetter = function (_ref2) {
        var props = _ref2.props;
        var state = _ref2.state;
        var listeners = _ref2.listeners;
        return {
            service: Service,
            options: {
                props: props,
                state: state,
                updater: listeners.createUpdater({ id: id + ".updater", state: state })
            }
        };
    };

    return Def({
        id: id + ".getter",
        handler: diGetter,
        deps: {
            listeners: Listeners,
            state: stateDef,
            props: propsDef
        }
    });
}

function cache(cb) {
    return function (Service, a2, a3) {
        Service.__di = cb(Service, a2, a3);
        return Service;
    };
}

function cachedWaitFor(Service, deps) {
    Service.__di.waitFor = WaitFor(deps);
    return Service;
}

function cachedDef(options) {
    function fn(p) {
        return p;
    }
    fn.__di = Def(options);
    return fn;
}

var Promises = {
    ignore: function ignore(p) {
        return p["catch"](function () {});
    }
};

module.exports = {
    getDef: getDef,
    State: cache(State),
    Class: cache(Class),
    Factory: cache(Factory),
    WaitFor: cachedWaitFor,
    Def: cachedDef,
    Promises: Promises
};