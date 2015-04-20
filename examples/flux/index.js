import __bootstrap from './bootstrap'

import React from 'react'
import {Container, NativeAdapter, Dispatcher, Define, ReactConnector} from '../../src'
import TodoList from './components/todo-list'
import debug from 'debug'

const info = debug('immutable-di:flux:index')
const Wrapper = ReactConnector(React)

const {Factory, Class, Getter} = Define

class TodoStore {
    handle(state, action, payload) {
        return this[action] && this[action].call(this, state, payload)
    }

    reset(state, initialState) {
        return initialState.todoApp
    }

    addTodo(state, todo) {
        state.todos.push(todo)
        return state
    }

    loadTodosProgress(state) {
        info('loadTodosProgress')
        state.loading = true

        return state
    }

    loadTodosSuccess(state, todos) {
        info('loadTodosSuccess %o', todos)
        state.todos = todos
        state.loading = false

        return state
    }

    loadTodosFail(state, err) {
        info('loadTodosFail %o', err)
        state.loading = false
        state.error = err

        return state
    }
}

class TodoActions {
    constructor(dispatcher) {
        this.dispatch = dispatcher.dispatch.bind(dispatcher)
    }

    addTodo(todo) {
        return this.dispatch('addTodo', todo)
    }

    loadTodos() {
        // simulate fetch
        return this.dispatch('loadTodos', Promise.resolve([
            {name: 'todo-1', id: 1},
            {name: 'todo-2', id: 2}
        ]))
    }
}
Class(TodoActions, [Dispatcher])

function stateGetter(appState) {
    return appState
}
Factory(stateGetter, ['todoApp'])
Getter(stateGetter, {
    actions: TodoActions,
    dispatcher: Dispatcher,
    state: stateGetter
})

const el = document.getElementById('app')
const container = new Container({
    state: new NativeAdapter()
})

const stores = {
    todoApp: new TodoStore()
}

container.get(Dispatcher).then(dispatcher => {
    dispatcher.setStores(stores)

    dispatcher.once(stateGetter, ({getter, deps}) => {
        const {dispatcher, state, actions} = deps

        React.render((
            <Wrapper
                context={{actions}}
                dispatcher={dispatcher}
                state={state}
                getter={getter}
                component={TodoList}
            />
        ), el)
    })

    dispatcher.dispatch('reset', {
        todoApp: {
            loading: false,
            error: null,
            todos: []
        }
    })
    const todoActions = new TodoActions(dispatcher)
    todoActions.addTodo({name: 'todo-new', id: 333})
    todoActions.loadTodos()
})
