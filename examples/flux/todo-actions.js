import {Class, Setter, Apply} from 'immutable-di/define'

@Class({
    setTodos: Setter(['todoApp', 'todos']),
    applyTodos: Apply(['todoApp', 'todos']),
    setMeta: Setter(['todoApp', 'meta'])
})
export default class TodoActions {
    _cursor: AbstractCursor

    constructor(options) {
        this._o = options
        this.__id = 3
    }

    setTodo(id, data) {
        this._o.applyTodos(todos => todos.map(todo =>
            todo.id === id ?
                {...todo, ...data} :
                todo
        ))
        // prevent cursor jump to end in input in async
        .commit()
    }

    deleteTodo(id) {
        this._o.setMeta({
            error: false,
            loading: true
        })

        return Promise.resolve({status: 'ok', id})
            .then(data => {
                this._o.applyTodos(todos => todos.filter(todo => todo.id !== data.id))
                this._o.setMeta({
                    loading: false,
                    error: false
                })
            })
            .catch(err =>
                this._o.setMeta({
                    error: err,
                    loading: false
                })
            )
    }

    _createId() {
        return ++this.__id
    }

    addTodo(todo) {
        return this._o.applyTodos(todos => todos.concat([{...todo, id: this._createId()}]))
    }

    loadTodos() {
        const dataPromise = Promise.resolve([
            {title: 'todo-1', id: 1, description: '123'},
            {title: 'todo-2', id: 2, description: '231'}
        ])

        return dataPromise.then(data =>
            this._o.setTodos(data)
        )
    }
}
