'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.Getter = Getter;
exports.Path = Path;
exports.Assign = Assign;
exports.Setter = Setter;
exports.Def = Def;
exports.Class = Class;
exports.Factory = Factory;
exports.Facet = Facet;

var _cursorsAbstract = require('./cursors/abstract');

var _cursorsAbstract2 = _interopRequireDefault(_cursorsAbstract);

var _utilsDep = require('./utils/Dep');

var _utilsDep2 = _interopRequireDefault(_utilsDep);

function Getter(path) {
    var key = path.join('.');
    var id = 'get#' + key;
    function getter(cursor) {
        return cursor.select(path).get;
    }
    return (0, _utilsDep2['default'])({
        deps: [_cursorsAbstract2['default']],
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

    return (0, _utilsDep2['default'])({
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
    function assigner(cursor) {
        return cursor.select(path).assign;
    }

    return (0, _utilsDep2['default'])({
        deps: [_cursorsAbstract2['default']],
        displayName: id,
        id: id,
        isSetter: true
    })(assigner);
}

function Setter(path) {
    var key = path.join('.');
    var id = 'setter#' + key;
    function setter(cursor) {
        return cursor.select(path).set;
    }

    return (0, _utilsDep2['default'])({
        deps: [_cursorsAbstract2['default']],
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

    return (0, _utilsDep2['default'])({
        displayName: id,
        id: id
    })(def);
}

function Class(deps, displayName) {
    return (0, _utilsDep2['default'])({
        deps: deps,
        displayName: displayName,
        isClass: true,
        pathMapper: Path
    });
}

function Factory(deps, displayName) {
    return (0, _utilsDep2['default'])({
        deps: deps,
        displayName: displayName,
        pathMapper: Path
    });
}

function Facet(deps, displayName) {
    return (0, _utilsDep2['default'])({
        deps: deps,
        displayName: displayName,
        isCachedTemporary: true,
        pathMapper: Path
    });
}
//# sourceMappingURL=define.js.map