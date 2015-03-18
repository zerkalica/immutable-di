export default class StateHandler {
    constructor({dispatcher, definition, initialState, actions}) {
        this._dispatcher = dispatcher
        this._StateUpdater = null
        this._definition = definition
        this._initialState = initialState
        this.actions = actions
    }

    getInitialState() {
        return this._initialState
    }

    _createStateUpdater(updateState, definition) {
        function StateUpdater(state) {
            updateState(state)
            // undefined values do not store into di-cache
            return 1
        }
        StateUpdater.__factory = ['StateUpdater', definition]

        return StateUpdater
    }

    mount(updateState) {
        if (this._StateUpdater) {
            throw new Error('Unmount state updater first')
        }
        this._StateUpdater = this._createStateUpdater(updateState, this._definition)
        this._dispatcher.mount(this._StateUpdater)
    }

    unmount() {
        if (this._StateUpdater) {
            this._dispatcher.unmount(this._StateUpdater)
            this._StateUpdater = null
        }
    }
}
