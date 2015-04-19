import Container from './container'

export default class ContainerCreator {
    constructor(StateAdapter) {
        this._StateAdapter = StateAdapter
        this._globalCache = new Map()
    }

    create(state) {
        return new Container({
            state: new this._StateAdapter(state),
            globalCache: this._globalCache
        })
    }
}
