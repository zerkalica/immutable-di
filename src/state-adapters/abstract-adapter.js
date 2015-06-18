export type PathType = Array<string>

export default class AbstractStateAdapter {
    setUpdater(update) {
        this._update = update
    }

    _update() {

    }

    get(path) {
        throw new Error('implement')
    }
    set(path, newState) {
        throw new Error('implement')
    }
}
