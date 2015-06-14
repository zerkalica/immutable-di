import {Class} from '../../src/define'
import Dispatcher from '../../src/dispatcher'

@Class([Dispatcher])
export default class TodoActions {
    dispatcher: Dispatcher
    constructor(dispatcher: Dispatcher) {
        this.dispatcher = dispatcher
    }

    deleteTodo(id) {
        const dataPromise = Promise.resolve({status: 'ok', id})
        this.dispatcher.update(['todoApp', 'meta'], state =>
            Object.assign(state, {error: false, loading: true})
        )

        return dataPromise
            .then(data =>
                this.dispatcher.update(['todoApp'], state =>
                    Object.assign(state, {
                        meta: {loading: false, error: false},
                        todos: state.todos.filter(({id}) => id !== data.id)
                    })
                )
            )
            .catch(err =>
                this.dispatcher.update(['todoApp', 'meta'], state =>
                    Object.assign(state, {error: err, loading: false})
                )
            )
    }

    addTodo(todo) {
        return this.dispatcher.update(['todoApp', 'todos'], todos =>
            [].concat(todos).concat([todo])
        )
    }

    loadTodos() {
        const dataPromise = Promise.resolve([
            {title: 'todo-1', id: 1, description: '123'},
            {title: 'todo-2', id: 2, description: '231'}
        ])

        return dataPromise.then(data =>
            this.dispatcher.update(['todoApp', 'todos'], state =>
                Object.assign(state, data)
            )
        )
    }
}
