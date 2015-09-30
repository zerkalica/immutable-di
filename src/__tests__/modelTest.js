/* eslint-env mocha */
import {Factory, Path, Cursor} from '../define'
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

function ModPath(path, spec, value) {
    const _path = Path(path)
    _path.__di.value = value
    _path.__di.spec = spec
    return _path
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
        result = ModPath(path, struct(specs, 'I' + path.join('.')), value)
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]
            result[k] = props[k]
        }
    } else {
        result = ModPath(path, spec, value)
    }
    return result
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

class ITest1TcombModel {
    static $schema = struct({
        path: Str,
        query: struct({
            a: Str,
            b: maybe(Str)
        })
    })
    // static $ = makeCursorsFromTcomb(ITest1TcombModel.$schema)

    static $default = {
        path: 'test',
        query: {
            a: 'aaa',
            b: ''
        }
    }

    path: string
    query: {
        a: string,
        b: ?string
    }
}

/*
  Facet([ITest1TcombModel.$])((v: ITest1TcombModel) => {
    // v
  })

  Facet([ITest1TcombModel.$.query])((v: ITest1TcombModel.$schema.query.a) => {
    // v
  })
*/


describe.skip('modelTest', () => {
    it('should get whole model data', () => {
        const ITest1TcombModel = ''

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
            test1Model.query.$
        ])(fn)

        assert.deepEqual(container.get(dep), {a: 'aaa', b: undefined})
    })
})
