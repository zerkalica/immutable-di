'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.Getter = Getter;
exports.Path = Path;
exports.Assign = Assign;
exports.Setter = Setter;
exports.Apply = Apply;
exports.Def = Def;
exports.Class = Class;
exports.Facet = Facet;
exports.Factory = Factory;

var _cursorsAbstract = require('./cursors/abstract');

var _cursorsAbstract2 = _interopRequireDefault(_cursorsAbstract);

var _utilsDep = require('./utils/Dep');

var _utilsDep2 = _interopRequireDefault(_utilsDep);

var _asserts = require('./asserts');

var ids = {};

function pass(p) {
    return p;
}

function convertId(dn) {
    if (!ids[dn]) {
        ids[dn] = (0, _utilsDep.getId)();
    }

    return ids[dn];
}

function Getter(path) {
    (0, _asserts.IPath)(path);
    var key = path.join('.');
    var displayName = 'get_' + key;
    function getter(cursor) {
        return cursor.select(path).get;
    }
    return Getter.extend((0, _utilsDep2['default'])({
        deps: [_cursorsAbstract2['default']],
        displayName: displayName,
        id: convertId(displayName)
    }))(getter);
}

Getter.extend = pass;

function Path(path) {
    (0, _asserts.IPath)(path);
    var key = path.join('.');
    var displayName = 'path_' + key;
    function getData(get) {
        return get();
    }

    return Path.extend((0, _utilsDep2['default'])({
        deps: [Getter(path)],
        displayName: displayName,
        id: convertId(displayName),
        isCachedTemporary: true,
        path: path
    }))(getData);
}

Path.extend = pass;

function Assign(path) {
    (0, _asserts.IPath)(path);
    var key = path.join('.');
    var displayName = 'assign_' + key;
    function assigner(cursor) {
        return cursor.select(path).assign;
    }

    return Assign.extend((0, _utilsDep2['default'])({
        deps: [_cursorsAbstract2['default']],
        displayName: displayName,
        id: convertId(displayName),
        isSetter: true
    }))(assigner);
}

Assign.extend = pass;

function Setter(path) {
    (0, _asserts.IPath)(path);
    var key = path.join('.');
    var displayName = 'setter_' + key;
    function setter(cursor) {
        return cursor.select(path).set;
    }

    return Setter.extend((0, _utilsDep2['default'])({
        deps: [_cursorsAbstract2['default']],
        displayName: displayName,
        id: convertId(displayName),
        isSetter: true
    }))(setter);
}

Setter.extend = pass;

function Apply(path) {
    (0, _asserts.IPath)(path);
    var key = path.join('.');
    var displayName = 'apply_' + key;
    function setter(cursor) {
        return cursor.select(path).apply;
    }

    return Apply.extend((0, _utilsDep2['default'])({
        deps: [_cursorsAbstract2['default']],
        displayName: displayName,
        id: convertId(displayName),
        isSetter: true
    }))(setter);
}

Apply.extend = pass;

function Def(data) {
    var displayName = 'def_' + JSON.stringify(data);
    function def() {
        return data;
    }

    return Def.extend((0, _utilsDep2['default'])({
        displayName: displayName,
        id: convertId(displayName)
    }))(def);
}

Def.extend = pass;

function Class(deps, displayName) {
    return Class.extend((0, _utilsDep2['default'])({
        deps: deps,
        displayName: displayName,
        isClass: true,
        pathMapper: Path
    }));
}

Class.extend = pass;

function Facet(deps, displayName) {
    return Facet.extend((0, _utilsDep2['default'])({
        deps: deps,
        displayName: displayName,
        isCachedTemporary: true,
        pathMapper: Path
    }));
}

Facet.extend = pass;

function Factory(deps, displayName) {
    return Factory.extend((0, _utilsDep2['default'])({
        deps: deps,
        displayName: displayName,
        pathMapper: Path
    }));
}

Factory.extend = pass;
//# sourceMappingURL=define.js.map