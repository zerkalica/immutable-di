/* eslint-env mocha */
import {Factory} from '../define'
import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'
import AbstractCursor from '../cursors/abstract'
import {struct, maybe, Str} from 'tcomb'
import sinon from 'sinon'

/*
const ITest1TcombConvertedModel = {
    __di: {
        path: ['route'],
        spec: struct({
            path: Str,
            query: struct({
                a: Str,
                b: maybe(Str)
            })
        }),
    },
    path: {
        __di: {
            value: '',
            path: ['route', 'path'],
            spec: Str
        }
    },
    query: {
        __di : {
            path: ['route', 'query'],
            spec: struct({
                a: Str,
                b: maybe(Str)
            })
        },
        a: {
            __di: {
                value: 'aaa',
                path: ['route', 'query', 'a'],
                spec: Str
            }
        },
        b: {
            __di: {
                value: '',
                path: ['route', 'query', 'b'],
                spec: maybe(Str)
            }
        }
    }
}
*/

const lastId = 1
function getId() {
    return lastId++
}

function fromTcomb(rawSpec, path) {
    let value
    let result
    let spec
    if (!Array.isArray(path)) {
        throw new Error('path is not an array')
    }

    if (Array.isArray(rawSpec)) {
        value = rawSpec[1]
        spec = rawSpec[0]
    } else {
        spec = rawSpec
    }

    if (spec !== null && typeof spec === 'object') {
        const keys = Object.keys(spec)
        const specs = {}
        const props = {}
        value = {}
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]
            const rec = fromTcomb(spec[k], path.concat(k))
            specs[k] = rec.__di.spec
            value[k] = rec.__di.value
            props[k] = rec
        }
        result = Path(path, struct(specs, 'I' + path.join('.')), value, getId())
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]
            result[k] = props[k]
        }
    } else {
        result = Path(path, spec, value)
    }
    return result
}

function Selector(path, spec) {
    const displayName = 'cursor@' + path.join('.')
    function selector(cursor) {
        return cursor.select(path)
    }
    selector.displayName = displayName
    selector.__di = {
        displayName,
        id: (displayName),
        deps: [
            {
                definition: AbstractCursor
            }
        ]
    }
    return selector
}

function Path(path, spec, value, pathId) {
    const displayName = 'path@' + path.join('.')
    const cur = Selector(path, spec)
    function _path(cursor) {
        return cursor.get()
    }
    _path.$cursor = cur
    _path.displayName = displayName
    _path.__di = {
        displayName,
        pathId,
        id: (displayName),
        deps: [
            {
                definition: cur
            }
        ],
        path,
        value,
        spec
    }
    return _path
}

function buildState(stateSpec) {
    function reducer(acc, key) {
        const {value, pathId} = stateSpec[key].__di
        acc.state[key] = value
        acc.pathMap[key] = pathId
        return acc
    }
    return Object.keys(stateSpec).reduce(reducer, {
        state: {},
        pathMap: {}
    })
}
describe('model', () => {
    it('should get whole model data', () => {
        const ITest1TcombModel = {
            path: [Str, ''],
            query: {
                a: [Str, 'aaa'],
                b: maybe(Str)
            }
        }

        const IStateModel = {
            route: ITest1TcombModel
        }

        const {state, pathMap} = buildState(IStateModel)
        const cursor = new NativeCursor(state, pathMap)
        const container = new Container(cursor, {synced: true})

        const test1Model = fromTcomb(ITest1TcombModel)

        function fn(query) {
            return query
        }

        const dep = Factory([
            test1Model.query,
            test1Model.query.$cursor
        ])(fn)

        assert.deepEqual(container.get(dep), state.route.query)
    })
})
