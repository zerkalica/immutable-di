export default class PageStore {
    static __class = ['PageStore']
    handle(actionType, payload) {
        if (this[actionType]) {
            return this[actionType].call(this, payload)
        }
    }

    reset(PageStoreData) {
        this._state = PageStoreData
    }

    addTodo(todo) {
        this.state.page.todos.push(todo)

        return this.state.page
    }
}
