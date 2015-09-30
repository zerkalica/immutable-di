/* eslint-env mocha */
import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'
import {Factory} from '../define'
import sinon from 'sinon'

describe('stateChangesTest', () => {
    it('should handle a.b, if a changed', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123
            }
        })
        const container = new Container(cursor)
        const MyDep = Factory([['a', 'b']])(v => v)
        container.get(MyDep)
        cursor.select(['a']).set({b: 321}).commit()
        assert.equal(container.get(MyDep), 321)
    })

    it('should handle a, if a.b changed', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123
            }
        })
        const container = new Container(cursor)
        const MyDep = Factory([['a']])(v => v)
        container.get(MyDep)
        cursor.select(['a', 'b']).set(321).commit()
        assert.deepEqual(container.get(MyDep), {
            b: 321
        })
    })

    it('should not handle a.c, if a.b changed', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123,
                c: 'test'
            }
        })
        const container = new Container(cursor)
        const MyDep = Factory([['a', 'c']])(v => v)
        container.get(MyDep)
        cursor.select(['a', 'b']).set(321).commit()
        assert(container.get(MyDep) === 'test')
    })

    it('should handle a.b, if a.b changed', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123
            }
        })
        const container = new Container(cursor)
        const MyDep = Factory([['a', 'b']])(v => v)
        container.get(MyDep)
        cursor.select(['a', 'b']).set(321).commit()
        assert(container.get(MyDep) === 321)
    })

    it('should update state on next timer tick', done => {
        const cursor = new NativeCursor({
            a: {
                b: 123
            }
        })
        const container = new Container(cursor)
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.get(MyDep)
        cursor.select(['a', 'b']).set(321)
        setTimeout(() => {
            container.get(MyDep)
            assert(MyDep.calledTwice)
            assert(MyDep.firstCall.calledWith(123))
            assert(MyDep.secondCall.calledWith(321))
            done()
        }, 0)
    })
})
