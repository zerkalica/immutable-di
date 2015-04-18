function getInPath(obj, bits) {
    for(let i = 0, j = bits.length; i < j; ++i) {
        obj = obj[bits[i]]
    }
    return obj
}

export default class NativeAdapter {
    constructor(state) {
        this._state = state || {}
    }

    getIn(path) {
        return getInPath(this._state, path)
    }

    get(id) {
        return this._state[id]
    }

    transformState(mutations) {
        const updatedScopes = []
        for (let i = 0; i < mutations.length; i++) {
            const {statePath, data} = mutations[i]
            if (data !== undefined) {
                updatedScopes.push(statePath)
                this._state[statePath] = data
            }
        }
        return updatedScopes
    }
}
