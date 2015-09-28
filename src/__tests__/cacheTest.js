/* eslint-env mocha */
import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'
import {Factory} from '../define'
import sinon from 'sinon'

describe('cache', () => {
    it('should hit, if no changes', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123
            }
        })
        const container = new Container(cursor)
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.get(MyDep)
        container.get(MyDep)
        assert(fn.calledOnce)
    })

    it('should not hit, if a.b changed', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123
            }
        })
        const container = new Container(cursor)
        const fn = sinon.spy(v => {
            return v
        })
        const MyDep = Factory([['a', 'b']])(fn)
        container.get(MyDep)
        const c = cursor.select(['a', 'b'])
        c.set(321).commit()
        container.get(MyDep)
        assert(fn.calledTwice)
        assert(fn.firstCall.calledWith(123))
        assert(fn.secondCall.calledWith(321))
    })

    it('should hit, if a.c changed', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123,
                c: 'test'
            }
        })
        const container = new Container(cursor)
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.get(MyDep)
        cursor.select(['a', 'c']).set('test2').commit()
        container.get(MyDep)
        assert(fn.calledOnce)
    })

    it('should not hit, if a changed', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123,
                c: 'test'
            }
        })
        const container = new Container(cursor)
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.get(MyDep)
        cursor.select(['a']).set({
            b: 123,
            c: 'test2'
        }).commit()
        container.get(MyDep)
        assert(fn.calledTwice)
    })
})
