'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.Class = Class;
exports.Factory = Factory;
exports.Facet = Facet;
exports.Getter = Getter;
exports.Path = Path;
exports.Assign = Assign;
exports.Setter = Setter;
exports.Def = Def;

var _utilsGetFunctionName = require('./utils/get-function-name');

var _utilsGetFunctionName2 = _interopRequireDefault(_utilsGetFunctionName);

var __Container = '__DICONTAINER__';

exports.__Container = __Container;
function normalizeDeps(d) {
    var resultDeps = [];
    var deps = d || [];
    var isArray = Array.isArray(deps);
    var names = isArray ? [] : _Object$keys(deps);
    var len = isArray ? deps.length : names.length;

    for (var i = 0; i < len; i++) {
        var _name = names.length ? names[i] : undefined;
        var dep = deps[_name || i];
        resultDeps.push({
            name: _name,
            definition: Array.isArray(dep) ? Path(dep) : dep
        });
    }

    return resultDeps;
}

function updateIdsMap(map, id, normalizedDeps) {
    for (var i = 0, j = normalizedDeps.length; i < j; i++) {
        var dep = normalizedDeps[i];
        if (dep.definition === __Container) {
            break;
        }
        var _path = dep.definition.__di.path;
        if (_path && _path.length) {
            if (id) {
                var parts = [];
                for (var ii = 0, jj = _path.length; ii < jj; ii++) {
                    parts.push(_path[ii]);
                    var key = parts.toString();
                    var ids = map[key];
                    if (!ids) {
                        ids = [];
                        map[key] = ids;
                    }
                    if (ids.indexOf(id) === -1) {
                        ids.push(id);
                    }
                }
            }
        } else {
            if (!dep.definition) {
                throw new Error('no definition in dep: ' + dep);
            }
            if (!dep.definition.__di) {
                throw new Error('no definition in dep.definition: ' + dep.definition);
            }
            updateIdsMap(map, id, dep.definition.__di.deps);
        }
    }
}

var lastId = 1;
var __pathToIdsMap = {};

exports.__pathToIdsMap = __pathToIdsMap;
function getDeps(id, deps) {
    var normalizedDeps = normalizeDeps(deps);
    updateIdsMap(__pathToIdsMap, id, normalizedDeps);
    return normalizedDeps;
}

function Dep(_ref) {
    var deps = _ref.deps;
    var displayName = _ref.displayName;
    var isClass = _ref.isClass;
    var isCachedTemporary = _ref.isCachedTemporary;

    return function __Dep(Service) {
        var id = Service.__di ? Service.__di.id : lastId++;
        Service.__di = {
            id: id,
            displayName: displayName || Service.displayName || (0, _utilsGetFunctionName2['default'])(Service) || id,
            isClass: isClass,
            isCachedTemporary: isCachedTemporary,
            isOptions: !Array.isArray(deps),
            deps: getDeps(isCachedTemporary ? null : id, deps)
        };

        return Service;
    };
}

function Class(deps, displayName) {
    return Dep({
        deps: deps,
        displayName: displayName,
        isClass: true,
        isCachedTemporary: false
    });
}

function Factory(deps, displayName) {
    return Dep({
        deps: deps,
        displayName: displayName,
        isClass: false,
        isCachedTemporary: false
    });
}

function Facet(deps, displayName) {
    return Dep({
        deps: deps,
        displayName: displayName,
        isClass: false,
        isCachedTemporary: true
    });
}

function Getter(path, displayName) {
    var key = path.join('.');
    function getter(container) {
        return container.select(path, key).get;
    }

    var definition = Facet([__Container], displayName || 'get#' + key)(getter);
    definition.__di.id = 'get#' + key;
    return definition;
}

function Path(path) {
    var key = path.join('.');
    function getter(container) {
        return container.select(path, key).get();
    }

    var definition = Facet([__Container], 'path#' + key)(getter);
    definition.__di.id = 'path#' + key;
    definition.__di.path = path;
    return definition;
}

function Assign(path) {
    var key = path.join('.');
    function assigner(container) {
        return container.select(path, key).assign;
    }

    var definition = Facet([__Container], 'set#' + key)(assigner);
    definition.__di.id = 'assign#' + key;
    return definition;
}

function Setter(path) {
    var key = path.join('.');
    function setter(container) {
        return container.select(path, key).set;
    }

    var definition = Facet([__Container], 'set#' + key)(setter);
    definition.__di.id = 'set#' + key;
    return definition;
}

function Def(data) {
    function def() {
        return data;
    }
    var id = 'def_' + JSON.stringify(data);

    return Facet([], id)(def);
}
//# sourceMappingURL=define.js.map