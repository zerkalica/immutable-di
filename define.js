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
exports.Facet = Facet;
exports.Factory = Factory;

var _cursorsAbstract = require('./cursors/abstract');

var _cursorsAbstract2 = _interopRequireDefault(_cursorsAbstract);

var _utilsDep = require('./utils/Dep');

var _utilsDep2 = _interopRequireDefault(_utilsDep);

var _historyMonitorFactory = require('./history/MonitorFactory');

var _historyMonitorFactory2 = _interopRequireDefault(_historyMonitorFactory);

var ids = {};

function convertId(dn) {
    if (!ids[dn]) {
        ids[dn] = (0, _utilsDep.getId)();
    }

    return ids[dn];
}

var settings = {
    debug: false
};

exports.settings = settings;

function Getter(path) {
    var key = path.join('.');
    var displayName = 'get#' + key;
    function getter(cursor) {
        return cursor.select(path).get;
    }
    return (0, _utilsDep2['default'])({
        deps: [_cursorsAbstract2['default']],
        displayName: displayName,
        id: convertId(displayName)
    })(getter);
}

function Path(path) {
    var key = path.join('.');
    var displayName = 'path#' + key;
    function getData(get) {
        return get();
    }

    return (0, _utilsDep2['default'])({
        deps: [Getter(path)],
        displayName: displayName,
        id: convertId(displayName),
        isCachedTemporary: true,
        path: path
    })(getData);
}

function Assign(path) {
    var key = path.join('.');
    var displayName = 'assign#' + key;
    function assigner(cursor) {
        return cursor.select(path).assign;
    }

    return (0, _utilsDep2['default'])({
        deps: [_cursorsAbstract2['default']],
        displayName: displayName,
        id: convertId(displayName),
        isSetter: true
    })(assigner);
}

function Setter(path) {
    var key = path.join('.');
    var displayName = 'setter#' + key;
    function setter(cursor) {
        return cursor.select(path).set;
    }

    return (0, _utilsDep2['default'])({
        deps: [_cursorsAbstract2['default']],
        displayName: displayName,
        id: convertId(displayName),
        isSetter: true
    })(setter);
}

function Def(data) {
    var displayName = 'def#' + JSON.stringify(data);
    function def() {
        return data;
    }

    return (0, _utilsDep2['default'])({
        displayName: displayName,
        id: convertId(displayName)
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

function Facet(deps, displayName) {
    return (0, _utilsDep2['default'])({
        deps: deps,
        displayName: displayName,
        isCachedTemporary: true,
        pathMapper: Path
    });
}

function Factory(deps, displayName) {
    var origDep = (0, _utilsDep2['default'])({
        deps: deps,
        displayName: displayName,
        pathMapper: Path
    });

    return settings.debug ? (0, _historyMonitorFactory2['default'])(origDep) : origDep;
}
//# sourceMappingURL=define.js.map