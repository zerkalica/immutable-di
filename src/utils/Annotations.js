import AbstractCursor from '../cursors/abstract'

export default class CreateAnnotations {
    constructor(addMeta) {
        this._addMeta = addMeta
        this.Cursor = ::this.Cursor
        this.Path = ::this.Path

        this.Class = ::this.Class
        this.Facet = ::this.Facet
        this.Factory = ::this.Factory
        this.Def = ::this.Def

        this.Getter = ::this.Getter
        this.Setter = ::this.Setter
        this.Apply = ::this.Apply
        this.Assign = ::this.Assign
    }

    _getName(prefix, path) {
        return prefix + '@' + path.join('.')
    }

    /**
     * @deprecated: use Cursor
     */
    _reflectCursor(fn, prefix, path) {
        const displayName = this._getName(prefix, path)
        return this._addMeta(fn, {
            displayName,
            id: displayName,
            deps: [this.Cursor(path)]
        })
    }

    Cursor(path) {
        const displayName = this._getName('cursor', path)
        return this._addMeta(cursor => cursor.select(path), {
            displayName,
            id: displayName,
            deps: [this.Class()(AbstractCursor)]
        })
    }

    Path(path) {
        const cur = this.Cursor(path)
        const displayName = this._getName('path', path)
        return this._addMeta(cursor => cursor.get(), {
            displayName,
            id: displayName,
            isCachedTemporary: true,
            path,
            deps: [cur]
        })
    }

    /**
     * @deprecated: use Cursor
     */
    Getter(path) {
        return this._reflectCursor(cursor => cursor.get, 'getter', path)
    }

    /**
     * @deprecated: use Cursor
     */
    Assign(path) {
        return this._reflectCursor(cursor => cursor.assign, 'assign', path)
    }

    /**
     * @deprecated: use Cursor
     */
    Setter(path) {
        return this._reflectCursor(cursor => cursor.set, 'setter', path)
    }

    /**
     * @deprecated: use Cursor
     */
    Apply(path) {
        return this._reflectCursor(cursor => cursor.apply, 'apply', path)
    }

    Class(deps) {
        const add = this._addMeta
        return function _class(Service) {
            return add(Service, {
                isClass: true,
                deps
            })
        }
    }

    Facet(deps) {
        const add = this._addMeta
        return function facet(Service) {
            return add(Service, {
                isCachedTemporary: true,
                deps
            })
        }
    }

    Factory(deps) {
        const add = this._addMeta
        return function factory(Service) {
            return add(Service, {
                deps
            })
        }
    }

    Def(data) {
        const displayName = 'def@' + JSON.stringify(data)
        return this._addMeta(() => data, {
            id: displayName,
            displayName
        })
    }
}
