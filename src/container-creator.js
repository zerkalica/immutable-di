import Container from './container'
import GenericAdapter from './definition-adapters/generic-adapter'

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
