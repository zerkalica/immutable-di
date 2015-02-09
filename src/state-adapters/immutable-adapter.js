import Immutable from 'immutable'

export default class ImmutableAdapter {
    constructor(state) {
        this._state = Immutable.fromJS(state || {})
    }
    isEqual(next) {
        return Immutable.is(this._state, next)
    }
    isEqualIn(next, path) {
        return Immutable.is(this._state.getIn(path), next.getIn(path))
    }
    getIn(path) {
        return this._state.getIn(path)
    }
    set(state) {
        this._state = state
    }
    transform(cb) {
        return this._state.withMutations((state) => {
            const get = state.get.bind(state)
            const set = state.set.bind(state)
            cb(get, set)
        })
    }
}
