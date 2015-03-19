export default class Context {
    constructor({dispatcher, definition, actions, onUpdate}) {
        this._dispatcher = dispatcher
        this._definition = definition
        this._actions = actions
        this._onUpdate = onUpdate
        this._updaterDefinition = null
    }

    _getDefinition(onUpdate) {
        let updaterDefinition = (props) => {
            onUpdate({
                props,
                actions: this._actions,
                context: this
            })
            // undefined values do not store into di-cache
            return 1
        }
        updaterDefinition.__factory = ['StateUpdater', this._definition]

        return updaterDefinition
    }

    mount(onUpdate) {
        if (this._updaterDefinition) {
            throw new Error('Do unmount first')
        }
        this._updaterDefinition = this._getDefinition(onUpdate || this._onUpdate)
        this._dispatcher.mount(this._updaterDefinition)
    }

    unmount() {
        if (!this._updaterDefinition) {
            throw new Error('Do mount first')
        }
        this._dispatcher.unmount(this._updaterDefinition)
        this._updaterDefinition = null
    }
}
