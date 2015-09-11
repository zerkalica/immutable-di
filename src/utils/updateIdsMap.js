export default function updateIdsMap(acc: {ids: string[], map: object, isAction: bool}, definition) {
    const normalizedDeps = definition.__di.deps
    const {id, isCachedTemporary} = definition.__di
    if (acc.affectedIds[id]) {
        return
    }
    acc.affectedIds[id] = true
    acc.parentIds.push(id)

    for (let i = 0, j = normalizedDeps.length; i < j; i++) {
        const dep = normalizedDeps[i]
        if (!dep.definition.__di) {
            throw new Error('Not a definition: ' + i + ': ' + JSON.stringify(dep))
        }
        const {path, isSetter} = dep.definition.__di
        if (isSetter) {
            acc.isAction = true
        }

        if (path && path.length) {
            if (!isCachedTemporary) {
                const parts = []
                for (let ii = 0, jj = path.length; ii < jj; ii++) {
                    parts.push(path[ii])
                    const key = parts.join('.')
                    let ids = acc.map[key]
                    if (!ids) {
                        ids = []
                    }

                    acc.map[key] = ids.concat(acc.parentIds)
                }
            }
        } else {
            updateIdsMap(acc, dep.definition)
        }
    }
}
