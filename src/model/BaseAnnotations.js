
export default class BaseAnnotations {
    _addMeta() {
        throw new Error('implement')
    }

    _getName(prefix, path) {
        return prefix + '@' + path.join('.')
    }

    Cursor(path) {
        const displayName = this._getName('cursor', path)
        return this._addMeta(select => select(path), {
            displayName,
            id: displayName,
            deps: [this._Selector]
        })
    }

    Path(path) {
        const cur = this.Cursor(path)
        const displayName = this._getName('path', path)
        return this._addMeta(cursor => cursor.get(), {
            displayName,
            id: displayName,
            isCachedTemporary: true,
            path,
            deps: [cur]
        })
    }
}
