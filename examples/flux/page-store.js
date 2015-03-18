export default class PageStore {
    static __class = ['PageStore']
    state = null
    handle(actionType, payload) {
        if (this[actionType]) {
            return this[actionType].call(this, payload)
        }
    }

    reset(pageStoreData) {
        this.state = pageStoreData

        return pageStoreData
    }

    addTodo(todo) {
        this.state.todos.push(todo)

        return this.state
    }
}
