import {Class, Factory} from 'immutable-di/define'
import Cursor from 'immutable-di/cursor'

@Class([Cursor])
export default class TodoActions {
    cursor: Cursor

    constructor(cursor: Cursor) {
        this.cursor = cursor.select(['todoApp'])
        this.__id = 3
    }

    deleteTodo(id) {
        const dataPromise = Promise.resolve({status: 'ok', id})
        this.cursor.set(['meta'], {
            error: false,
            loading: true
        })

        return dataPromise
            .then(data =>
                this.cursor.set([], state => {
                    return {
                        meta: {
                            loading: false,
                            error: false
                        },
                        todos: state.todos.filter(({id}) => id !== data.id)
                    }
                })
            )
            .catch(err =>
                this.cursor.set(['meta'], {error: err, loading: false})
            )
    }

    addTodo(todo) {
        return this.cursor.set(['todos'], todos =>
            todos.concat([{...todo, id: this.__id++}])
        )
    }

    loadTodos() {
        const dataPromise = Promise.resolve([
            {title: 'todo-1', id: 1, description: '123'},
            {title: 'todo-2', id: 2, description: '231'}
        ])

        return dataPromise.then(data =>
            this.cursor.set(['todos'], data)
        )
    }
}
