import Dispatcher from './dispatcher'

export default class Context {
    constructor(dispatcher) {
        this._dispatcher = dispatcher
        this._updaterDefinition = null
    }

    _getDefinition(definition, onUpdate) {
        function updater(props) {
            onUpdate(props)
            // undefined values do not store into di-cache
            return 1
        }
        updater.__factory = definition.__props

        return updaterDefinition
    }

    mount(definition, onUpdate) {
        if (this._updaterDefinition) {
            throw new Error('Do unmount first')
        }
        this._updaterDefinition = this._getDefinition(definition, onUpdate)
        this._dispatcher.mount(this._updaterDefinition)
    }

    unmount() {
        if (!this._updaterDefinition) {
            throw new Error('Do mount first')
        }
        this._dispatcher.unmount(this._updaterDefinition)
        this._updaterDefinition = null
    }

    static Factory(displayName, deps, Provider) {
        Provider = Provider || state => state
        Provider.__factory = [displayName, deps]
    }
}
