/* eslint-env mocha */
import assert from 'power-assert'
import TcombCursor from '../TcombCursor'

describe('TcombCursorSetTest', () => {
    const state = {
        todos: [
            {
                id: 1,
                title: 'test'
            }
        ],
        user: {
            payment: {
                value: 123
            }
        }
    }

    it('should replace all state', () => {
        const cursor = new TcombCursor({
            stateRoot: {
                state
            },
            prefix: []
        })

        const newState = {
            todos: [
                {
                    id: 1123,
                    title: 'test1213'
                }
            ],
            user: {
                payment: {
                    value: 321
                },
                someData: 123
            }
        }

        cursor.set(newState)

        assert.deepEqual(cursor.get(), newState)
    })

    it('should replace state in path', () => {
        const stateRoot = {state}
        const cursor = new TcombCursor({
            stateRoot,
            prefix: ['user', 'payment', 'value']
        })

        cursor.set(321)
        assert(cursor.get() === 321)
    })

    it('should merge state', () => {
        const stateRoot = {state}
        const cursor = new TcombCursor({
            stateRoot,
            prefix: ['user', 'payment']
        })

        const newItem = {
            value: 321,
            info: 'test info'
        }

        cursor.assign(newItem)
        assert.deepEqual(cursor.get(), newItem)
    })
})
