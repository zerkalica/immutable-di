/* eslint-env mocha */
import {Factory, Path, Cursor} from '../define'
import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'
import AbstractCursor from '../cursors/abstract'
import {struct, maybe, Str} from 'tcomb'
import sinon from 'sinon'

function createStateFakeValidator() {
    return function createFakeValidator() {
        return function _validate() {
        }
    }
}

function buildState(stateSpec) {
    const state = {}
    const pathMap = {}
    const schema = {}

    const keys = Object.keys(stateSpec)
    let hasSchema = false
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const {displayName, $schema, $default} = stateSpec[key]
        state[key] = $default
        if ($schema) {
            schema[key] = $schema
            hasSchema = true
        }
        pathMap[displayName] = key
    }

    return {
        state,
        pathMap,
        schema: hasSchema ? schema : undefined
    }
}

function getName(fn) {
    return fn.displayName || getFunctionName(fn)
}

function createCursors(props, path) {
    const acc = {}
    if (props !== null && typeof props === 'object') {
        const keys = Object.keys(props)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            acc[key] = createCursors(props[key], path.concat(key))
        }
    }
    acc.$ = {$path: path}
    return acc
}


function defaults(defs) {
    return function wrapClass(Class) {
        const displayName = getName(Class)
        if (!Class.displayName) {
            Class.displayName = displayName
        }
        Class.$default = defs
        Class.$ = createCursors(defs, [displayName])

        return Class
    }
}

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

function createStateTcombValidator(schema) {
    const flattenSchema = {}
    makeFlatTcombSchema(schema, flattenSchema, [])
    return function createValidator(path) {
        const schemaPart = flattenSchema[path.join('.')]
        return function _validate(data) {
            return validate(schemaPart, data)
        }
    }
}

function createStateValidator(schema) {
    return schema
        ? createStateTcombValidator(struct(schema, 'IAppState'))
        : createStateFakeValidator()
}

function typecheck(schema) {
    return function wrapClass(Class) {
        Class.$schema = struct(schema, getName(Class))

        return Class
    }
}

type ICursor = {$path: Array<string>}

@defaults({
    path: 'test',
    query: {
        a: 'aaa',
        b: ''
    }
})
@typecheck({
    path: Str,
    query: struct({
        a: Str,
        b: maybe(Str)
    })
})
class ITest1TcombModel {
    static $: {
        path: {
            $: ICursor
        },
        query: {
            $: ICursor,
            a: {
                $: ICursor
            },
            b: {
                $: ICursor
            }
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
