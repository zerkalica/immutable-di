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
                    c: 'test'
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

describe('cacheTest', () => {
    it('should hit, if no changes', () => {
        const container = createContainer()
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.get(MyDep)
        container.get(MyDep)
        assert(fn.calledOnce)
    })

    it('should not hit, if a.b changed', () => {
        const container = createContainer()
        const fn = sinon.spy(v => {
            return v
        })
        const MyDep = Factory([['a', 'b']])(fn)
        container.get(MyDep)
        const c = container.get(Selector)(['a', 'b'])
        c.set(321).commit()
        container.get(MyDep)
        assert(fn.calledTwice)
        assert(fn.firstCall.calledWith(123))
        assert(fn.secondCall.calledWith(321))
    })

    it('should hit, if a.c changed', () => {
        const container = createContainer()
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.get(MyDep)
        container.get(Selector)(['a', 'c']).set('test2').commit()
        container.get(MyDep)
        assert(fn.calledOnce)
    })

    it('should not hit, if a changed', () => {
        const container = createContainer()
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.get(MyDep)
        container.get(Selector)(['a']).set({
            b: 123,
            c: 'test2'
        }).commit()
        container.get(MyDep)
        assert(fn.calledTwice)
    })
})
