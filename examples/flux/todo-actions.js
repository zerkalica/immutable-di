import {Class} from '../../src/define'
import Updater from '../../src/updater'

@Class([Updater])
export default class TodoActions {
    updater: Updater
    constructor(updater: Updater) {
        this.updater = Updater
    }

    deleteTodo(id) {
        const dataPromise = Promise.resolve({status: 'ok', id})
        this.updater.set(['todoApp', 'meta'], state =>
            Object.assign(state, {error: false, loading: true})
        )

        return dataPromise
            .then(data =>
                this.updater.set(['todoApp'], state =>
                    Object.assign(state, {
                        meta: {loading: false, error: false},
                        todos: state.todos.filter(({id}) => id !== data.id)
                    })
                )
            )
            .catch(err =>
                this.updater.set(['todoApp', 'meta'], state =>
                    Object.assign(state, {error: err, loading: false})
                )
            )
    }

    addTodo(todo) {
        return this.updater.set(['todoApp', 'todos'], todos =>
            [].concat(todos).concat([todo])
        )
    }

    loadTodos() {
        const dataPromise = Promise.resolve([
            {title: 'todo-1', id: 1, description: '123'},
            {title: 'todo-2', id: 2, description: '231'}
        ])

        return dataPromise.then(data =>
            this.updater.set(['todoApp', 'todos'], state =>
                Object.assign(state, data)
            )
        )
    }
}
