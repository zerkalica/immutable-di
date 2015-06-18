'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _Map = require('babel-runtime/core-js/map')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

exports.Class = Class;
exports.Factory = Factory;

var _utilsGetFunctionName = require('../utils/get-function-name');

var _utilsGetFunctionName2 = _interopRequireDefault(_utilsGetFunctionName);

var _get = require('./get');

var _get2 = _interopRequireDefault(_get);

function processDeps(deps) {
    var resultDeps = [];
    deps = deps || [];
    var isArray = Array.isArray(deps);
    var names = isArray ? [] : _Object$keys(deps);
    var len = isArray ? deps.length : names.length;

    for (var i = 0; i < len; i++) {
        var _name = names.length ? names[i] : undefined;
        var dep = deps[_name || i];
        var _isArray = Array.isArray(dep);
        resultDeps.push({
            name: _name,
            path: _isArray ? dep : null,
            definition: _isArray ? null : dep,
            promiseHandler: null,
            isProto: false
        });
    }

    return resultDeps;
}

function updateIdsMap(map, id, normalizedDeps) {
    for (var i = 0; i < normalizedDeps.length; i++) {
        var dep = normalizedDeps[i];
        if (dep.path && dep.path.length) {
            (function () {
                var parts = [];
                dep.path.forEach(function (part) {
                    parts.push(part);
                    var key = parts.toString();
                    var ids = map.get(key);
                    if (!ids) {
                        ids = [];
                        map.set(key, ids);
                    }
                    if (ids.indexOf(id) === -1) {
                        ids.push(id);
                    }
                });
            })();
        } else if (!dep.isProto) {
            if (!dep.definition) {
                throw new Error('no definition in dep: ' + dep);
            }
            if (!dep.definition.__di) {
                throw new Error('no definition in dep.definition: ' + dep.definition);
            }
            updateIdsMap(map, id, (0, _get2['default'])(dep.definition).deps);
        }
    }
}

var lastId = 1;
function getId(Service, idPrefix) {
    idPrefix = idPrefix || lastId;
    var id = Service.__id;
    if (!id) {
        id = (0, _utilsGetFunctionName2['default'])(Service) + '#' + idPrefix;
        lastId++;
    }

    return id;
}

var __pathToIdsMap = new _Map();

function extractDef(_ref) {
    var id = _ref.id;
    var deps = _ref.deps;
    var isClass = _ref.isClass;

    var normalizedDeps = processDeps(deps);
    updateIdsMap(__pathToIdsMap, id, normalizedDeps);

    return {
        id: id,
        isClass: isClass,
        deps: normalizedDeps
    };
}

exports.__pathToIdsMap = __pathToIdsMap;

function Class(deps, id) {
    return function __Class(Service) {
        Service.__di = extractDef({
            id: id || getId(Service),
            isClass: true,
            deps: deps || {}
        });

        return Service;
    };
}

function Factory(deps, id) {
    return function __Factory(Service) {
        Service.__di = extractDef({
            id: id || getId(Service),
            isClass: false,
            deps: deps || {}
        });
        return Service;
    };
}