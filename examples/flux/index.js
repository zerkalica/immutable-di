import __bootstrap from './bootstrap'

import React from 'react'
import {NativeAdapter, Dispatcher, Define, ReactConnector} from '../../src'
import TodoList from './components/todo-list'
import debug from 'debug'

const info = debug('immutable-di:flux:index')
const Wrapper = ReactConnector(React)

const {Factory, Class, Getter} = Define

class TodoStore {
    handle(state, action, payload) {
        return this[action] && this[action].call(this, state, payload)
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

    loadTodos({fromId}) {
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

const dispatcher = new Dispatcher({
    stores: {
        todoApp: new TodoStore()
    },
    stateAdapter: new NativeAdapter()
})

dispatcher.once(stateGetter).then(({getter, deps}) => {
    info('getter %o, getter: %o', deps, getter)
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

dispatcher.setState({
    todoApp: {
        loading: false,
        error: null,
        todos: []
    }
})
