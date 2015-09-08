import {Assign, Setter, Factory} from 'immutable-di/define'

export function Loadable(path, loader) {
    return {
        __di: {
            isLoadable: true,
            path,
            loader
        }
    }
}

export function Loader(path, loaderComb) {
    return {
        __di: {
            isLoader: true,
            loaderComb,
            path
        }
    }
}

export default function normalizeStateMap(stateMap) {
    const newStateMap = {}

    const setters = {}
    const loaders = {}

    let queryName
    let loaderComb
    let controlPath

    const keys = Object.keys(stateMap)
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i]
        const dep = stateMap[keys[i]]
        const {isQuery, isLoader, isLoadable, path, loader} = typeof dep.__di === 'object' ? dep.__di : {}

        if (isLoader) {
            controlPath = path
            newStateMap[k] = path
            loaderComb = dep.__di.loaderComb
        } else if (isQuery) {
            queryName = k
            newStateMap[k] = dep
        } else if (isLoadable) {
            newStateMap[k] = path
            loaders[k] = loader
            setters[k] = Setter(path)
        } else {
            newStateMap[k] = dep
        }
    }

    function AssignState(sets) {
        return function assignState(obj) {
            Object.keys(obj).forEach(k =>
                sets[k](obj[k])
            )
        }
    }

    function LoadState({resolvers, assignState, assignControl}) {
        return function loadState(props) {
            const query = props[queryName]
            if (!query.isErrors) {
                assignControl({
                    isError: false,
                    isLoading: true,
                    errors: {}
                })

                return loaderComb(query.params, resolvers)
                    .then(state => {
                        assignControl({isLoading: false})
                        assignState(state)
                    })
                    .catch(e =>
                        assignControl({
                            isLoading: false,
                            isError: true,
                            error: e.message
                        })
                    )
            }
        }
    }

    newStateMap.__loadState = Factory({
        resolvers: Factory(loaders)(p => p),
        assignState: Factory(setters)(AssignState),
        assignControl: Assign(controlPath)
    })(LoadState)

    return newStateMap
}
