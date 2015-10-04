/* eslint-env mocha */
import assert from 'power-assert'
import Container from '../Container'
import NativeCursor from '../cursors/NativeCursor'
import {Factory} from '../define'
import sinon from 'sinon'
import Selector from '../model/Selector'

function createContainer() {
    return new Container({
        stateSpec: {
            a: {
                defaults: {
                    b: 123,
                    c: 111
                },

                $: {
                    $: {},
                    b: {
                        $: {}
                    },
                    c: {
                        $: {}
                    }
                }
            }
        },
        cursor: NativeCursor
    })
}

describe('stateChangesTest', () => {
    it('should handle a.b, if a changed', () => {
        const container = createContainer()
        const MyDep = Factory([['a', 'b']])(v => v)
        container.get(MyDep)
        container.get(Selector)(['a']).set({b: 321}).commit()
        assert.equal(container.get(MyDep), 321)
    })

    it('should handle a, if a.b changed', () => {
        const container = createContainer()
        const MyDep = Factory([['a']])(v => v)
        container.get(MyDep)
        container.get(Selector)(['a', 'b']).set(321).commit()
        assert.deepEqual(container.get(MyDep), {
            b: 321,
            c: 111
        })
    })

    it('should not handle a.c, if a.b changed', () => {
        const container = createContainer()
        const MyDep = Factory([['a', 'c']])(v => v)
        container.get(MyDep)
        container.get(Selector)(['a', 'b']).set(321).commit()
        assert(container.get(MyDep) === 111)
    })

    it('should handle a.b, if a.b changed', () => {
        const container = createContainer()
        const MyDep = Factory([['a', 'b']])(v => v)
        container.get(MyDep)
        container.get(Selector)(['a', 'b']).set(321).commit()
        assert(container.get(MyDep) === 321)
    })

    it('should update state on next timer tick', done => {
        const container = createContainer()
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.get(MyDep)
        container.get(Selector)(['a', 'b']).set(321)
        setTimeout(() => {
            container.get(MyDep)
            assert(MyDep.calledTwice)
            assert(MyDep.firstCall.calledWith(123))
            assert(MyDep.secondCall.calledWith(321))
            done()
        }, 0)
    })
})
