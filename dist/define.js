'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _classToFactory$getFunctionName = require('./utils');

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
        var _isArray = Array.isArray(dep);
        var isPromise = _isArray && dep.length === 2;
        var isProto = _isArray && dep.length === 1;
        var isPath = typeof dep === 'string';
        var path = isPath ? null : dep;
        var definition = isPromise || isProto ? dep[0] : path;
        resultDeps.push({
            name: _name,
            promiseHandler: isPromise ? dep[1] || pass : null,
            path: isPath ? dep.split('.') : null,
            definition: definition,
            isProto: isProto
        });
    }

    return resultDeps;
}

function getScopes(normalizedDeps, scopeSet) {
    for (var i = 0; i < normalizedDeps.length; i++) {
        var dep = normalizedDeps[i];
        if (dep.path && dep.path.length) {
            scopeSet.add(dep.path[0]);
        } else if (!dep.isProto) {
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
    var deps = _ref.deps;
    var isClass = _ref.isClass;

    var normalizedDeps = processDeps(deps);
    var scopeSet = new Set();
    getScopes(normalizedDeps, scopeSet);
    var scopes = Array.from(scopeSet.values());

    return {
        id: id,
        isClass: isClass,
        scope: scopes.length ? scopes[0] : 'global',
        deps: normalizedDeps
    };
}

var Annotation = {
    Class: function Class(Service, deps, id) {
        Service.__di = extractDef({
            id: id || getId(Service),
            isClass: true,
            deps: deps || {}
        });
        return Service;
    },

    Factory: function Factory(Service, deps, id) {
        Service.__di = extractDef({
            id: id || getId(Service),
            isClass: false,
            deps: deps || {}
        });
        return Service;
    },

    Getter: function Getter(Service, deps, id) {
        Service.__di.getter = Annotation.Factory(function (p) {
            return p;
        }, deps, (id || getId(Service)) + '__getter');
        return Service;
    }
};

function createGetter(stateDeps, deps, id) {
    id = id || 'state';
    var stateGetter = Annotation.Factory(function (p) {
        return p;
    }, stateDeps, id + '__main');
    var depsDefinition = Annotation.Factory(function (p) {
        return p;
    }, deps || {}, id + '__deps');
    Annotation.Getter(stateGetter, {
        state: stateGetter,
        getter: [stateGetter],
        deps: depsDefinition
    }, id);

    return stateGetter;
}

var Promises = {
    ignore: function ignore(p) {
        return p['catch'](function () {});
    }
};

exports['default'] = {
    getDef: getDef,
    Promises: Promises,
    createGetter: createGetter,
    Getter: Annotation.Getter,
    Class: Annotation.Class,
    Factory: Annotation.Factory
};
module.exports = exports['default'];