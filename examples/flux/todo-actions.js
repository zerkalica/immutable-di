import {Class} from '../../src/define'
import Updater from '../../src/updater'

@Class([Updater])
export default class TodoActions {
    updater: Updater

    constructor(updater: Updater) {
        this.updater = updater.select(['todoApp'])
    }

    deleteTodo(id) {
        const dataPromise = Promise.resolve({status: 'ok', id})
        this.updater.set(['meta'], {
            error: false,
            loading: true
        })

        return dataPromise
            .then(data =>
                this.updater.set([], state => ({
                    meta: {
                        loading: false,
                        error: false
                    },
                    todos: state.todos.filter(({id}) => id !== data.id)
                }))
            )
            .catch(err =>
                this.updater.set(['meta'], {error: err, loading: false}))
            )
    }

    addTodo(todo) {
        return this.updater.set(['todos'], todos =>
            [].concat(todos).concat([todo])
        )
    }

    loadTodos() {
        const dataPromise = Promise.resolve([
            {title: 'todo-1', id: 1, description: '123'},
            {title: 'todo-2', id: 2, description: '231'}
        ])

        return dataPromise.then(data =>
            this.updater.set(['todos'], data)
        )
    }
}
