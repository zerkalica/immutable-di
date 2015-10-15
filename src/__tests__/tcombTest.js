import {update, struct, list, dict, maybe, Num, Bool, Str} from 'tcomb'
import assert from 'power-assert'

describe('tcombTest', () => {
    const IState = struct({
        todos: list(struct({
            id: Num,
            title: Str
        })),

        currentUser: struct({
            login: Str,
            pass: Str
        }),
        isDebug: Bool
    })

    const initialState = {
        todos: [],
        currentUser: {
            login: 'test',
            pass: '123'
        },
        isDebug: false
    }

    it('should update struct state in deep path', () => {
        const state = IState(initialState)

        const item = {
            id: 123,
            title: 'test'
        }

        const newState = update(state, {
            todos: {
                $push: [item]
            }
        })

        assert.deepEqual(newState.todos[0], item)
        assert(newState !== state)
        assert(newState.currentUser === state.currentUser)
    })

    it('should update raw state in deep path', () => {
        const state = initialState
        const item = {
            id: 123,
            title: 'test'
        }

        const newState = update(state, {
            todos: {
                $push: [item]
            }
        })

        assert.deepEqual(newState.todos[0], item)
        assert(newState !== state)
        assert(newState.currentUser === state.currentUser)
    })
})
