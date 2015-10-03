import AbstractCursor from './abstract'

export default class NativeCursor extends AbstractCursor {
    _selector = null
    _cnName = null
    constructor(options) {
        super(options)

        const prefix = this._prefix
        if (prefix.length) {
            this._cnName = prefix[prefix.length - 1]
            /* eslint-disable no-new-func */
            this._selector = new Function('s', 'return ' + ['s']
                .concat(prefix)
                .slice(0, -1)
                .join('.')
            )
            try {
                if (this._selector(this._state) === undefined) {
                    throw new Error('Undefined value ' + prefix[prefix.length - 1])
                }
            } catch(e) {
                e.message = e.message + ', path: ' + prefix.join('.')
                throw e
            }
            /* eslint-enable no-new-func */
        } else {
            this._cnName = '_state'
            // trick to obtain this._state in get/set/apply/assign
            this._selector = function __selector() {
                return this
            }
        }
    }

    toJSON(): string {
        return JSON.stringify(this._state)
    }

    snap(): object {
        return JSON.parse(JSON.stringify(this._state))
    }

    diff(prevState: object): object {
        return {}
    }

    patch(patches: Array<object>) {
        throw new Error('implement')
    }

    get() {
        return this._selector(this._state)[this._cnName]
    }

    set(newState) {
        const node = this._selector(this._state)
        if (newState !== node[this._cnName]) {
            this._assert(newState)
            node[this._cnName] = newState
            this._update()
        }

        return this
    }

    apply(fn: (v: State) => State) {
        const newValue = fn(this.get())
        this._assert(newValue)
        this.set(newValue)
        return this
    }

    assign(newState) {
        const node = this._selector(this._state)[this._cnName]
        let isUpdated = false
        const keys = Object.keys(newState)
        for (let i = 0, j = keys.length; i < j; i++) {
            const k = keys[i]
            if (node[k] !== newState[k]) {
                this._assert(newState[k], k)
                node[k] = newState[k]
                isUpdated = true
            }
        }
        if (isUpdated) {
            this._update()
        }

        return this
    }
}
