type IPathToIdsMap = {[path: string]: Array<string>}
type IIdToPathsMap = {[id: string]: Array<string>}

class PathMapUpdater {
    _pathsSets: {[id: string]: {[path: string]: bool}} = {}
    _ids: Array<string> = []

    constructor(pathToIdsMap: IPathToIdsMap, idToPathsMap: IIdToPathsMap) {
        this._pathToIdsMap = pathToIdsMap
        this._idToPathsMap = idToPathsMap
    }

    isAffected(id: string) {
        const pth: ?Array<string> = this._idToPathsMap[id]
        if (pth) {
            for (let i = 0; i < pth.length; i++) {
                this.addPath(pth[i])
            }
            return true
        }

        return false
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

    end(id: string) {
        const paths = Object.keys(this._pathsSets[id])
        const pathToIdsMap = this._pathToIdsMap
        this._idToPathsMap[id] = paths
        for (let i = 0; i < paths.length; i++) {
            const k = paths[i]
            if (!pathToIdsMap[k]) {
                pathToIdsMap[k] = []
            }
            pathToIdsMap[k].push(id)
        }
        delete this._pathsSets[id]
        this._ids.pop()
    }
}

function dependencyScanner(definition, acc: PathMapUpdater) {
    const {id, deps} = definition.__di
    if (!acc.isAffected(id)) {
        acc.begin(id)
        for (let i = 0; i < deps.length; i++) {
            const dep = deps[i].definition
            if (!dep) {
                throw new Error('dep[' + i + '] is undefined in ' + JSON.stringify(definition.__di))
            }
            const {path} = dep.__di
            if (path) {
                let key = ''
                const p = path.concat('*')
                for (let j = 0, l = p.length; j < l; j++) {
                    key = key + '.' + p[j]
                    acc.addPath(key)
                }
            } else {
                dependencyScanner(dep, acc)
            }
        }
        acc.end(id)
    }
}

export default function updateIdsMap(
    definition,
    pathToIdsMap: IPathToIdsMap,
    idToPathsMap: IIdToPathsMap
) {
    dependencyScanner(definition, new PathMapUpdater(pathToIdsMap, idToPathsMap))
}
