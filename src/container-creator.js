import Container from './container'

export default class ContainerCreator {
    constructor() {
        this._globalCache = new Map()
    }

    create(state) {
        return new Container({
            state,
            globalCache: this._globalCache
        })
    }
}
