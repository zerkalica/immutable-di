type IPathToIdsMap = {[path: string]: Array<string>}
type IIdToDef = {[id: string]: {deps: IDependency, paths: Array<string>}}

class PathMapUpdater {
    _pathsSets: {[id: string]: {[path: string]: bool}} = {}
    _ids: Array<string> = []

    constructor(pathToIdsMap: IPathToIdsMap, idToDef: IIdToDef) {
        this._pathToIdsMap = pathToIdsMap
        this._idToDef = idToDef
    }

    updateParents(pth) {
        for (let i = 0; i < pth.length; i++) {
            this.addPath(pth[i])
        }
    }

    begin(id: string) {
        this._ids.push(id)
        this._pathsSets[id] = {}
    }

    addPath(pathKey: string) {
        const ids = this._ids
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
        this._ids.pop()

        return paths
    }
}

export default class MetaLoader {
    constructor(driver) {
        this.pathToIdsMap = {}
        this._idToDef = {}
        this._driver = driver
    }

    getMeta(definition) {
        const id = this._driver.getId(definition)
        let result = this._idToDef[id]
        if (!result) {
            this._scan(definition, new PathMapUpdater(this.pathToIdsMap, this._idToDef))
            result = this._idToDef[id]
        }
        return result
    }

    _scan(definition, acc: PathMapUpdater) {
        const id = this._driver.getId(definition)
        if (this._idToDef[id]) {
            acc.updateParents(this._idToDef[id].paths)
        } else {
            acc.begin(id)
            const meta = this._driver.getMeta(definition)
            for (let i = 0; i < meta.deps.length; i++) {
                const dep = meta.deps[i].definition
                if (!dep) {
                    throw new Error('dep[' + i + '] is undefined in ' + JSON.stringify(meta))
                }
                const {path} = meta
                if (path) {
                    let key = ''
                    const p = path.concat('*')
                    for (let j = 0, l = p.length; j < l; j++) {
                        key = key + '.' + p[j]
                        acc.addPath(key)
                    }
                } else {
                    this._scan(dep, acc)
                }
            }
            const paths = acc.end(id)
            this._idToDef[id] = {
                ...meta,
                paths
            }
        }
    }
}
