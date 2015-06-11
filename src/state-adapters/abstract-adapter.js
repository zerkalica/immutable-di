export type PathType = Array<string>

export default class AbstractStateAdapter {
    get(path) {
        throw new Error('implement')
    }
    set(path, newState) {
        throw new Error('implement')
    }
}
