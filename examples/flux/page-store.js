export default class PageStore {
    static __class = ['PageStore']
    state = null
    handle(actionType, payload) {
        if (this[actionType]) {
            return this[actionType].call(this, payload)
        }
    }

    getInitialState() {
        return {
            status: 'initial',
            todos: [],
            currentTodo: {
                name: 'todo 1',
                text: 'todo text'
            }
        }
    }

    reset() {
        const pageStoreData = getInitialState()
        this.state = pageStoreData

        return pageStoreData
    }

    addTodo(todo) {
        this.state.todos.push(todo)

        return this.state
    }
}
