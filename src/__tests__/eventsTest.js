/* eslint-env mocha */
import {Factory} from '../define'
import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'
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

                cursor: {
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

describe('eventsTest', () => {
    it('should update mounted listener', () => {
        const container = createContainer()
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.mount(MyDep)
        container.get(Selector).select(['a', 'b']).set(321).commit()
        container.get(Selector).select(['a', 'b']).set(333).commit()
        assert(fn.calledTwice)
        assert(MyDep.firstCall.calledWith(321))
        assert(MyDep.secondCall.calledWith(333))
    })

    it('should not update listener, if changed another path', () => {
        const container = createContainer()
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.mount(MyDep)
        container.get(Selector).select(['a', 'c']).set(321).commit()
        assert(fn.notCalled)
    })

    it('should call listener once', () => {
        const container = createContainer()
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)
        container.once([['a', 'b']], MyDep)
        container.get(Selector).select(['a', 'b']).set(321).commit()
        container.get(Selector).select(['a', 'b']).set(432).commit()
        assert(fn.calledOnce)
        assert(fn.calledWith(321))
    })

    it('should not update unmounted listener', () => {
        const container = createContainer()
        const fn = sinon.spy(v => v)
        const MyDep = Factory([['a', 'b']])(fn)

        container.mount(MyDep)
        container.get(Selector).select(['a', 'b']).set(321).commit()
        container.unmount(MyDep)
        container.get(Selector).select(['a', 'b']).set(333).commit()

        assert(fn.calledOnce)
        assert(fn.calledWith(321))
    })
})
