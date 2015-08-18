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

function updateIdsMap(acc, normalizedDeps) {
    for (var i = 0, j = normalizedDeps.length; i < j; i++) {
        var dep = normalizedDeps[i];
        if (dep.definition === __Container) {
            break;
        }
        var _dep$definition$__di = dep.definition.__di;
        var _path = _dep$definition$__di.path;
        var isSetter = _dep$definition$__di.isSetter;
        var deps = _dep$definition$__di.deps;

        if (isSetter) {
            acc.isAction = true;
        }

        if (_path && _path.length) {
            if (acc.id) {
                var parts = [];
                for (var ii = 0, jj = _path.length; ii < jj; ii++) {
                    parts.push(_path[ii]);
                    var key = parts.toString();
                    var ids = acc.map[key];
                    if (!ids) {
                        ids = [];
                        acc.map[key] = ids;
                    }
                    if (ids.indexOf(acc.id) === -1) {
                        ids.push(acc.id);
                    }
                }
            }
        } else {
            updateIdsMap(acc, deps);
        }
    }
}

var lastId = 1;
var __pathToIdsMap = {};

exports.__pathToIdsMap = __pathToIdsMap;
function Dep(_ref) {
    var id = _ref.id;
    var displayName = _ref.displayName;
    var deps = _ref.deps;
    var isClass = _ref.isClass;
    var isCachedTemporary = _ref.isCachedTemporary;
    var isSetter = _ref.isSetter;
    var path = _ref.path;

    return function dep(Service) {
        id = id || (Service.__di ? Service.__di.id : lastId++);
        var dn = displayName || Service.displayName || (0, _utilsGetFunctionName2['default'])(Service) || id;
        var newDeps = normalizeDeps(deps);
        var acc = {
            map: __pathToIdsMap,
            isAction: false,
            id: isCachedTemporary ? null : id
        };
        updateIdsMap(acc, newDeps);

        Service.__di = {
            deps: newDeps,
            displayName: dn,
            id: id,
            isAction: acc.isAction,
            isSetter: !!isSetter,
            isCachedTemporary: !!isCachedTemporary,
            isClass: !!isClass,
            isOptions: !Array.isArray(deps),
            path: path
        };

        return Service;
    };
}

function Class(deps, displayName) {
    return Dep({
        deps: deps,
        displayName: displayName,
        isClass: true
    });
}

function Factory(deps, displayName) {
    return Dep({
        deps: deps,
        displayName: displayName
    });
}

function Facet(deps, displayName) {
    return Dep({
        deps: deps,
        displayName: displayName,
        isCachedTemporary: true
    });
}

function Getter(path) {
    var key = path.join('.');
    var id = 'get#' + key;
    function getter(container) {
        return container.select(path).get;
    }
    return Dep({
        deps: [__Container],
        displayName: id,
        id: id
    })(getter);
}

function Path(path) {
    var key = path.join('.');
    var id = 'path#' + key;
    function getData(get) {
        return get();
    }

    return Dep({
        deps: [Getter(path)],
        displayName: id,
        id: id,
        isCachedTemporary: true,
        path: path
    })(getData);
}

function Assign(path) {
    var key = path.join('.');
    var id = 'assign#' + key;
    function assigner(container) {
        return container.select(path).assign;
    }
    return Dep({
        deps: [__Container],
        displayName: id,
        id: id,
        isSetter: true
    })(assigner);
}

function Setter(path) {
    var key = path.join('.');
    var id = 'setter#' + key;
    function setter(container) {
        return container.select(path).set;
    }

    return Dep({
        deps: [__Container],
        displayName: id,
        id: id,
        isSetter: true
    })(setter);
}

function Def(data) {
    var id = 'def#' + JSON.stringify(data);
    function def() {
        return data;
    }

    return Dep({
        displayName: id,
        id: id
    })(def);
}
//# sourceMappingURL=define.js.map