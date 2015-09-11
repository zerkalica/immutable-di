/* eslint-env mocha */
import {Factory} from '../define'
import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'
import sinon from 'sinon'

describe('events', () => {
    it('should update mounted listener', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123
            }
        })
        const container = new Container(cursor)
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.mount(MyDep)
        cursor.select(['a', 'b']).set(321).commit()
        cursor.select(['a', 'b']).set(333).commit()
        assert(fn.calledTwice)
        assert(MyDep.firstCall.calledWith(321))
        assert(MyDep.secondCall.calledWith(333))
    })

    it('should not update listener, if changed another path', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123,
                c: 111
            }
        })
        const container = new Container(cursor)
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.mount(MyDep)
        cursor.select(['a', 'c']).set(321).commit()
        assert(fn.notCalled)
    })

    it('should call listener once', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123,
                c: 111
            }
        })
        const container = new Container(cursor)
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.once([['a', 'b']], MyDep)
        cursor.select(['a', 'b']).set(321).commit()
        cursor.select(['a', 'b']).set(432).commit()
        assert(fn.calledOnce)
        assert(fn.calledWith(321))
    })

    it('should not update unmounted listener', () => {
        const cursor = new NativeCursor({
            a: {
                b: 123
            }
        })
        const container = new Container(cursor)
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)

        container.mount(MyDep)
        cursor.select(['a', 'b']).set(321).commit()
        container.unmount(MyDep)
        cursor.select(['a', 'b']).set(333).commit()

        assert(fn.calledOnce)
        assert(fn.calledWith(321))
    })
})
