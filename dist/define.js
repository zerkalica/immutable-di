'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _classToFactory$getFunctionName = require('./utils');

var _WrapActionMethods = require('./flux/wrap-action-methods');

var _WrapActionMethods2 = _interopRequireWildcard(_WrapActionMethods);

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
        var isPromise = Array.isArray(dep) && dep.length === 2 && typeof dep[1] === 'function';
        var isPath = typeof dep === 'string';
        var path = isPath ? null : dep;
        var definition = isPromise ? dep[0] : path;
        resultDeps.push({
            name: _name,
            promiseHandler: isPromise ? dep[1] || pass : null,
            path: isPath ? dep.split('.') : null,
            definition: definition
        });
    }

    return resultDeps;
}

function getScopes(normalizedDeps, scopeSet) {
    for (var i = 0; i < normalizedDeps.length; i++) {
        var dep = normalizedDeps[i];
        if (dep.path && dep.path.length) {
            scopeSet.add(dep.path[0]);
        } else {
            if (!dep.definition) {
                throw new Error('no definition in dep: ' + dep);
            }
            if (!dep.definition.__di) {
                throw new Error('no definition in dep.definition: ' + dep.definition);
            }
            getScopes(getDef(dep.definition).deps, scopeSet);
        }
    }
}

var lastId = 1;
function getId(Service, idPrefix) {
    idPrefix = idPrefix || lastId;
    var id = Service.__id;
    if (!id) {
        id = _classToFactory$getFunctionName.getFunctionName(Service) + '[' + idPrefix + ']';
        lastId++;
    }

    return id;
}

function getDef(Service) {
    return Service.__di;
}

function extractDef(_ref) {
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
        scope: scopes.length ? scopes[0] : 'global',
        deps: normalizedDeps
    };
}

var Annotation = {
    Class: function Class(Service, deps) {
        Service.__di = extractDef({
            id: getId(Service),
            handler: _classToFactory$getFunctionName.classToFactory(Service),
            deps: deps || {}
        });
        return Service;
    },

    Factory: function Factory(Service, deps) {
        Service.__di = extractDef({
            id: getId(Service),
            handler: Service,
            deps: deps || {}
        });
        return Service;
    },

    Getter: function Getter(Service, deps) {
        var handler = function handler(deps) {
            return { deps: deps, getter: Service };
        };
        Service.__di.getter = Annotation.Def(handler, {
            id: getId(Service) + '__getter',
            handler: handler,
            deps: deps
        });
        return Service;
    },

    Def: function Def(Service, definition) {
        Service.__di = extractDef(definition);
        return Service;
    }
};

var Promises = {
    ignore: function ignore(p) {
        return p['catch'](function () {});
    }
};

exports['default'] = {
    getDef: getDef,
    Promises: Promises,
    Getter: Annotation.Getter,
    Def: Annotation.Def,
    Class: Annotation.Class,
    Factory: Annotation.Factory
};
module.exports = exports['default'];