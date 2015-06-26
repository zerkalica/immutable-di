import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'

describe('container', () => {
    let container
    const initialState = {
        todo: {
            todos: []
        }
    }

    beforeEach(() => {
        container = new Container(new NativeCursor(initialState))
    })

    it('should throws exception if no arguments passed', () => {
        assert.throws(() => container.get())
    })
})
