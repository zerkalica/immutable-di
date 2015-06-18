import {Class} from 'immutable-di/define'
import Container from 'immutable-di'
import type {AbstractCursor} from 'immutable-di/cursors/abstract'

@Class([Container])
export default class TodoActions {
    _cursor: AbstractCursor

    constructor(container: Container) {
        this._cursor = container.select(['todoApp'])
        this.__id = 3
    }

    deleteTodo(id) {
        this._cursor.set(['meta'], {
            error: false,
            loading: true
        })

        return Promise.resolve({status: 'ok', id})
            .then(data => {
                this._cursor.apply(['todos'], todos => todos.filter(todo => todo.id !== data.id))
                this._cursor.set(['meta'], {
                    loading: false,
                    error: false
                })
            })
            .catch(err =>
                this._cursor.set(['meta'], {
                    error: err,
                    loading: false
                })
            )
    }

    _createId() {
        return ++this.__id
    }

    addTodo(todo) {
        return this._cursor.apply(['todos'], todos => todos.concat([{...todo, id: this._createId()}]))
    }

    loadTodos() {
        const dataPromise = Promise.resolve([
            {title: 'todo-1', id: 1, description: '123'},
            {title: 'todo-2', id: 2, description: '231'}
        ])

        return dataPromise.then(data =>
            this._cursor.set(['todos'], data)
        )
    }
}
