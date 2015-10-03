import BaseAnnotations from './BaseAnnotations'
import AbstractDefinitionDriver from '../drivers/AbstractDefinitionDriver'
import Selector from './Selector'

export default class Annotations extends BaseAnnotations {
    driver: AbstractDefinitionDriver
    constructor(driver: AbstractDefinitionDriver) {
        super()
        this._addMeta = ::this._addMeta
        this.Cursor = ::this.Cursor
        this.Path = ::this.Path


        this.driver = driver
        driver.setAnnotations(this)
        this._Selector = this.Factory()(Selector)

        this.Class = ::this.Class
        this.Facet = ::this.Facet
        this.Factory = ::this.Factory
        this.Def = ::this.Def

        this.Getter = ::this.Getter
        this.Setter = ::this.Setter
        this.Apply = ::this.Apply
        this.Assign = ::this.Assign
    }

    _addMeta(fn, meta) {
        return this.driver.add(fn, meta)
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
