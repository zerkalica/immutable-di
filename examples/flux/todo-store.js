export default class TodoStore {
    static initialState = {
        loading: false,
        error: null,
        todos: []
    }

    handle(state, action, payload) {
        return this[action] && this[action].call(this, state, payload)
    }

    deleteTodoProgress(state, {id}) {
        state.loading = true
        state.error = false
        state.todos = state.todos.filter(todo => todo.id !== id)
        return state
    }

    deleteTodoSuccess(state, {id}) {
        state.loading = false
        return state
    }

    deleteTodoFail(state, err) {
        state.error = err
        state.loading = false
        return state
    }

    addTodo(state, todo) {
        state.todos.push(todo)
        return state
    }

    loadTodosProgress(state) {
        debug('loadTodosProgress')
        state.loading = true

        return state
    }

    loadTodosSuccess(state, newState) {
        newState.loading = false
        return newState
    }

    _loadTodosFail(state, err) {
        state.loading = false
        state.error = err

        return state
    }
}

