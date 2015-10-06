type IPathToIdsMap = {[path: string]: Array<string>}
type IIdToDef = {[id: string]: {deps: IDependency, paths: Array<string>}}

class PathMapUpdater {
    _pathsSets: {[id: string]: {[path: string]: bool}} = {}
    _parents: Array<string> = []

    constructor(pathToIdsMap: IPathToIdsMap, idToDef: IIdToDef, debugCtx) {
        this._pathToIdsMap = pathToIdsMap
        this._idToDef = idToDef
        this.debugCtx = debugCtx
    }

    updateParents(pth) {
        for (let i = 0; i < pth.length; i++) {
            this.addPath(pth[i])
        }
    }

    begin(id: string) {
        this._parents.push(id)
        this._pathsSets[id] = {}
    }

    addPath(pathKey: string) {
        const ids = this._parents
        const pathsSets = this._pathsSets
        for (let i = 0; i < ids.length; i++) {
            pathsSets[ids[i]][pathKey] = true
        }
    }

    end(id) {
        const paths = Object.keys(this._pathsSets[id])
        const pathToIdsMap = this._pathToIdsMap
        for (let i = 0; i < paths.length; i++) {
            const k = paths[i]
            if (!pathToIdsMap[k]) {
                pathToIdsMap[k] = []
            }
            pathToIdsMap[k].push(id)
        }
        delete this._pathsSets[id]

        const parents = [].concat(this._parents)
        this._parents.pop()

        return {parents, paths}
    }
}

export default class MetaLoader {
    pathToIdsMap = {}
    _idToDef = {}
    _driver
    _middlewares: Array<func>

    constructor(driver, middlewares: ?Array<func>) {
        this._driver = driver
        this._middlewares = middlewares || []
        this.getMeta = ::this.getMeta
    }

    getMeta(definition, debugCtx) {
        const id = this._driver.getId(definition)
        let result = this._idToDef[id]
        if (!result) {
            this._scan(definition, new PathMapUpdater(this.pathToIdsMap, this._idToDef, debugCtx))
            result = this._idToDef[id]
        }
        return result
    }

    _scan(definition, acc: PathMapUpdater) {
        const id = this._driver.getId(definition)
        if (this._idToDef[id]) {
            return acc.updateParents(this._idToDef[id].paths)
        }

        const meta = this._driver.getMeta(definition, acc.debugCtx)
        const {path, deps} = meta
        let paths = []
        let parents = []
        if (path) {
            let key = ''
            const p = path.concat('*')
            for (let j = 0, l = p.length; j < l; j++) {
                key = key + '.' + p[j]
                acc.addPath(key)
            }
        } else {
            acc.begin(id)
            for (let i = 0; i < deps.length; i++) {
                const dep = deps[i].definition
                if (!dep) {
                    throw new Error(meta.displayName + '.deps[' + i + '].definition is undefined')
                }
                this._scan(dep, acc)
            }
            const rec = acc.end(id)
            paths = rec.paths
            parents = rec.parents
        }

        this._idToDef[id] = this._middlewares.reduce(this._reducer, {
            ...meta,
            paths,
            parents
        })
    }

    _reducer(acc, reducer) {
        return reducer(acc)
    }
}
