export default class StateHandler {
    constructor({dispatcher, Getter, initialState}) {
        this._dispatcher = dispatcher
        this._StateUpdater = null
        this._Getter = Getter
        this._initialState = initialState
    }

    getInitialState() {
        return this._initialState
    }

    _createStateUpdater(updateState, Getter) {
        function StateUpdater(state) {
            updateState(state)
            // undefined values do not store into di-cache
            return 1
        }
        StateUpdater.__factory = ['StateUpdater', Getter]

        return StateUpdater
    }

    mount(updateState) {
        if (this._StateUpdater) {
            throw new Error('Unmount state updater first')
        }
        this._StateUpdater = this._createStateUpdater(updateState, this._Getter)
        this._dispatcher.mount(this._StateUpdater)
    }

    unmount() {
        if (this._StateUpdater) {
            this._dispatcher.unmount(this._StateUpdater)
            this._StateUpdater = null
        }
    }
}
