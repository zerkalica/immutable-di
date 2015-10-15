/* eslint-env mocha */
import assert from 'power-assert'
import TcombCursor from '../TcombCursor'

describe('TcombCursorGetTest', () => {
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

    it('should get data from root level', () => {
        const cursor = new TcombCursor({
            stateRoot: {state},
            prefix: []
        })

        assert.deepEqual(cursor.get(), state)
    })

    it('should get data from first level', () => {
        const cursor = new TcombCursor({
            stateRoot: {state},
            prefix: ['user']
        })

        assert.deepEqual(cursor.get(), state.user)
    })

    it('should get data from deep level', () => {
        const cursor = new TcombCursor({
            stateRoot: {state},
            prefix: ['user', 'value']
        })

        assert.deepEqual(cursor.get(), state.user.value)
    })

    it('should get data from array', () => {
        const cursor = new TcombCursor({
            stateRoot: {state},
            prefix: ['todos']
        })

        assert.deepEqual(cursor.at(0), state.todos[0])
    })


    it('should get data from array (out of bounds)', () => {
        const cursor = new TcombCursor({
            stateRoot: {state},
            prefix: ['todos']
        })

        assert.deepEqual(cursor.at(1), undefined)
    })
})
