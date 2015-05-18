import './bootstrap'

import React from 'react'
import {NativeAdapter, Dispatcher, ReactConnector} from '../../src'
const ReactComponent = ReactConnector(React)

import TodoStore from './todo-store'
import TodoActions from './todo-actions'
import TodoList from './components/todo-list'
import __debug from 'debug'
const debug = __debug('immutable-di:flux:index')


const el = document.getElementById('app')

const dispatcher = new Dispatcher({
    stores: {
        todoApp: new TodoStore()
    },
    state: new NativeAdapter({
        todoApp: TodoStore.initialState
    })
})
const todoActions = new TodoActions(dispatcher)

dispatcher.once(TodoList.getter, state =>
    React.render((
        <ReactComponent
            actions={todoActions}
            component={TodoList}
            dispatcher={dispatcher}
            state={state}
        />
    ), el)
)

//dispatcher.dispatch('reset', )
//todoActions.addTodo({name: 'todo-new', id: 333})
todoActions.loadTodos()
