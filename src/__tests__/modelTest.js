/* eslint-env mocha */
import {Factory} from '../define'
import {struct, maybe, Str} from 'tcomb'
import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/NativeCursor'

import createTcombValidator from '../validate/tcomb/createTcombValidator'

type IQuery = {
    a: string,
    b: ?string
}

type ITest1Model = {
    path: string,
    query: IQuery
}
const Test1Model = {
    _schema: struct({
        path: Str,
        query: struct({
            a: Str,
            b: maybe(Str)
        })
    }),
    defaults: {
        path: '3',
        query: {
            a: 'aaa',
            b: null
        }
    },
    cursor: {
        $: {},
        path: {$: {}},
        query: {
            $: {},
            a: {$: {}},
            b: {$: {}}
        }
    }
}

describe('modelTest', () => {
    it('should get whole model data', () => {
        const container = new Container({
            stateSpec: {
                route: Test1Model
            },
            cursor: NativeCursor,
            createValidator: createTcombValidator
        })

        function fn(query: IQuery, queryCursor: ICursor<IQuery>) {
            return query
        }

        const dep = Factory([
            Test1Model.cursor.query,
            Test1Model.cursor.query.$
        ])(fn)

        assert.deepEqual(container.get(dep), {a: 'aaa', b: null})
    })
})
