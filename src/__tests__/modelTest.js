/* eslint-env mocha */
import {Factory, Cursor} from '../define'
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

let lastId = 1
function getId() {
    return 'p' + lastId++
}

function fromTcomb(rawSpec, path) {
    let value
    let result
    let spec
    if (!path) {
        path = [getId()]
    }
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
        result = Path(path, struct(specs, 'I' + path.join('.')), value)
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]
            result[k] = props[k]
        }
    } else {
        result = Path(path, spec, value)
    }
    return result
}


function Path(path, spec, value) {
    const displayName = 'path@' + path.join('.')
    const cur = Cursor(path, spec)
    function _path(cursor) {
        return cursor.get()
    }
    _path.$cursor = cur
    _path.displayName = displayName
    _path.__di = {
        displayName,
        id: displayName,
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
        const {value, path} = stateSpec[key].__di
        acc.state[key] = value
        acc.pathMap[path[0]] = key
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

        const test1Model = fromTcomb(ITest1TcombModel)
        const IStateModel = {
            route: test1Model
        }

        const {state, pathMap} = buildState(IStateModel)
        const cursor = new NativeCursor(state, [], pathMap)
        const container = new Container(cursor, {synced: true})

        function fn(query, queryCursor) {
            return query
        }

        const dep = Factory([
            test1Model.query,
            test1Model.query.$cursor
        ])(fn)

        assert.deepEqual(container.get(dep), {a: 'aaa', b: undefined})
    })
})
