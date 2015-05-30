export default class TodoActions {
    constructor(dispatcher) {
        this.dispatcher = dispatcher
    }

    deleteTodo(id) {
        const dataPromise = Promise.resolve({status: 'ok', id})
        const cursor = dispatcher.cursor('todoApp')
        this.dispatcher.update('meta', state =>
            Object.assign(state, {error: false, loading: true})
        )

        return dataPromise
            .then(data =>
                this.dispatcher.update(null, state =>
                    Object.assign(state, {
                        meta: {loading: false, error: false},
                        todos: data
                    })
                )
            )
            .catch(err =>
                this.dispatcher.update('meta', state =>
                    Object.assign(state, {error: err, loading: false})
                )
            )
    }

    addTodo(todo) {
        return todo;
        return this.dispatcher.dispatch('addTodo', todo)
    }

    loadTodos() {
        // simulate fetch
        return this.dispatcher.dispatch('loadTodos', Promise.resolve([
            {name: 'todo-1', id: 1},
            {name: 'todo-2', id: 2}
        ]).then(todos => ({
            todos,
            loading: false
        })))
    }
}
