/* eslint-env mocha */
import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'
import {Factory, Getter, Setter} from '../define'
import sinon from 'sinon'

describe('settersGettersTest', () => {
    it('should get state in run-time', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123
            }
        })
        const container = new Container(cursor)
        const fn = sinon.spy(v => v)
        const MyDep = Factory([Getter(['a', 'b'])])(fn)

        container.get(MyDep)
        assert(container.get(MyDep)() === 123)
        cursor.select(['a', 'b']).set(321).commit()
        assert(container.get(MyDep)() === 321)
    })

    it('should set state in run-time', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123
            }
        })
        const container = new Container(cursor)
        const fn = sinon.spy(setId => {
            return v => setId(v).commit()
        })
        const MyDep = Factory([Setter(['a', 'b'])])(fn)

        assert(cursor.select(['a', 'b']).get() === 123)
        container.get(MyDep)(321)
        assert(cursor.select(['a', 'b']).get() === 321)
    })

    it('select should return instance of Cursor', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123
            }
        })
        assert(cursor.select(['a', 'b']) instanceof NativeCursor)
    })

    it('should throw error if node does not exists in the middle of path', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123
            }
        })
        assert.throws(() => cursor.select(['d', 'b', 'a']).get(), /path/)
    })
})
