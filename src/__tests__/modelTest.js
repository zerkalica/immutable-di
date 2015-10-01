/* eslint-env mocha */
import {Factory} from '../define'
import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'
import {struct, maybe, Str} from 'tcomb'
import buildState from '../model/buildState'
import defaults from '../model/defaults'
import typecheck from '../validate/tcomb/typecheck'
import createTcombValidator from '../validate/tcomb/createTcombValidator'

type ICursor = {$path: Array<string>}

@typecheck({
    path: Str,
    query: struct({
        a: Str,
        b: maybe(Str)
    })
})
@defaults({
    path: 'test',
    query: {
        a: 'aaa',
        b: ''
    }
})
class Test1Model {
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
    };
    path: string;
    query: {
        a: string,
        b: ?string
    };
}

describe('modelTest', () => {
    it('should get whole model data', () => {
        const stateSpec = {
            route: Test1Model
        }

        const {state, pathMap, validate} = buildState(stateSpec, createTcombValidator)
        const cursor = new NativeCursor(state, {pathMap})
        const container = new Container(cursor, {synced: true})

        function fn(query, queryCursor) {
            return query
        }

        const dep = Factory([
            Test1Model.$.query,
            Test1Model.$.query.$
        ])(fn)

        assert.deepEqual(container.get(dep), {a: 'aaa', b: ''})
    })
})
