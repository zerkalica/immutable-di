/* eslint-env mocha */
import {Factory, Path, Cursor} from '../define'
import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'
import AbstractCursor from '../cursors/abstract'
import {struct, maybe, Str} from 'tcomb'
import sinon from 'sinon'

function makeFlatTcombSchema(schema, flattenSchema, path) {
    const props = schema.meta.props
    if (props) {
        const keys = Object.keys(props)
        for (let i = 0; i < props.length; i++) {
            const key = keys[i]
            makeFlatTcombSchema(props[key], flattenSchema, path.concat(key))
        }
    }
    flattenSchema[path.join('.')] = schema
}

function createStateValidatorFromTcomb(schema) {
    const flattenSchema = {}
    makeFlatTcombSchema(schema, flattenSchema, [])
    return function createValidator(path) {
        const schemaPart = flattenSchema[path.join('.')]
        return function _validate(data) {
            return validate(schemaPart, data)
        }
    }
}


function makeCursorsFromTcomb(schema, path) {
    if (!schema || !schema.meta) {
        throw new TypeError('schema is not tcomb type')
    }

    const {props, name, kind} = schema.meta
    const acc = {}

    if (kind === 'struct') {
        if (!name) {
            throw new Error('need struct name')
        }
        const objPath = (path || []).concat(name)
        const keys = Object.keys(props)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            acc[key] = makeCursorsFromTcomb(props[key], objPath.concat(key))
        }
        acc.$ = {$path: objPath}
    } else {
        acc.$ = {$path: path}
    }

    return acc
}

function buildState(stateSpec) {
    function reducer(acc, key) {
        const {$schema, $default} = stateSpec[key]
        acc.state[key] = $default
        acc.schema[key] = $schema
        if (!$schema.meta.name) {
            throw new Error('Empty name in tcomb type: ' + key)
        }
        acc.pathMap[$schema.meta.name] = key
        return acc
    }
    const {state, pathMap, schema} = Object.keys(stateSpec).reduce(reducer, {
        state: {},
        pathMap: {},
        schema: {}
    })

    const validator = createStateValidatorFromTcomb(struct(schema))

    return {
        state,
        pathMap,
        validator
    }
}

class ITest1TcombModel {
    static $schema = struct({
        path: Str,
        query: struct({
            a: Str,
            b: maybe(Str)
        })
    }, 'ITest1TcombModel')
    static $ = makeCursorsFromTcomb(ITest1TcombModel.$schema)

    static $default = {
        path: 'test',
        query: {
            a: 'aaa',
            b: ''
        }
    }

    path: string;
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
