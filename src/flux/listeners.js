import {Class, Def} from '../define'

class Updater {
    update = p => p

    constructor({id, deps, listeners}) {
        this._id = id
        this._deps = deps
        this._listeners = listeners
        this._def = null
    }

    mount(onUpdate) {
        this._def = this._listeners.mount({
            id: this._id,
            deps: this._deps,
            onUpdate
        })
    }

    unmount() {
        this._listeners.unmount(this._def)
        this._def = null
    }
}

export default class Listeners {
    constructor() {
        this._listeners = []
    }

    createUpdater({id, deps}) {
        return new Updater({id, deps, listeners: this})
    }

    mount({id, deps, onUpdate}) {
        const definition = Def({id, deps, handler: onUpdate})
        this._listeners.push(definition)
        return definition
    }

    unmount(definition) {
        this._listeners = this._listeners.filter(d => definition === d)
    }

    forEach(cb) {
        this._listeners.forEach(listener => cb(listener))
    }
}
Class(Listeners)
