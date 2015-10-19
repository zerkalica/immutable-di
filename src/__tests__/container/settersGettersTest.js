/* eslint-env mocha */
import assert from 'power-assert'
import Container from '../../Container'
import NativeCursor from '../../cursors/NativeCursor'
import {Factory, Getter, Setter} from '../../define'
import sinon from 'sinon'
import Selector from '../../model/Selector'

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

describe('settersGettersTest', () => {
    it('should get state in run-time', () => {
        const container = createContainer()
        const fn = sinon.spy(v => v)
        const MyDep = Factory([Getter(['a', 'b'])])(fn)

        container.get(MyDep)
        assert(container.get(MyDep)() === 123)
        container.get(Selector)(['a', 'b']).set(321).commit()
        assert(container.get(MyDep)() === 321)
    })

    it('should set state in run-time', () => {
        const container = createContainer()
        const fn = sinon.spy(setId => {
            return v => setId(v).commit()
        })
        const MyDep = Factory([Setter(['a', 'b'])])(fn)

        assert(container.get(Selector)(['a', 'b']).get() === 123)
        container.get(MyDep)(321)
        assert(container.get(Selector)(['a', 'b']).get() === 321)
    })

    it('select should return instance of Cursor', () => {
        const container = createContainer()
        assert(container.get(Selector)(['a', 'b']) instanceof NativeCursor)
    })

    it('should throw error if node does not exists in the middle of path', () => {
        const container = createContainer()
        assert.throws(() => container.get(Selector)(['d', 'b', 'a']).get())
    })
})
