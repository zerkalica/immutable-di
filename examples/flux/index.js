import './bootstrap'

import React from 'react'
import {NativeAdapter, Dispatcher, ReactConnector} from '../../src'
const ReactComponent = ReactConnector(React)

import TodoList from './components/todo-list'
import debug from 'debug'
const info = debug('immutable-di:flux:index')

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

const el = document.getElementById('app')

const dispatcher = new Dispatcher({
    stores: {
        todoApp: new TodoStore()
    },
    state: new NativeAdapter({
        todoApp: {
            loading: false,
            error: null,
            todos: []
        }
    })
})
const todoActions = new TodoActions(dispatcher)

dispatcher.once(['todoApp'], ({getter, state}) => {
    React.render((
        <ReactComponent
            actions={todoActions}
            component={TodoList}

            dispatcher={dispatcher}
            state={state}
            getter={getter}
        />
    ), el)
})

//dispatcher.dispatch('reset', )
todoActions.addTodo({name: 'todo-new', id: 333})
todoActions.loadTodos()

