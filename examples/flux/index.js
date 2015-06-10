import './bootstrap'

import React from 'react'
import {NativeAdapter, Dispatcher, Container, ReactConnector} from '../../src'
const ReactComponent = ReactConnector(React)

import TodoStore from './todo-store'
import TodoActions from './todo-actions'
import TodoList from './components/todo-list'
import __debug from 'debug'
const debug = __debug('immutable-di:flux:index')


const el = document.querySelector('body')

const container = new Container(new NativeAdapter({
    todoApp: {
        meta: {
            loading: false,
            error: false
        },
        todos: [],
        query: {
            sortField: null,
            sortDirection: null
        }
    }
}))

const dispatcher = new Dispatcher({
    container: container
})
const todoActions = new TodoActions(dispatcher)

dispatcher.once(TodoList, state => {
    console.log(state)
    React.render((
        <ReactComponent
            actions={todoActions}
            component={TodoList}
            dispatcher={dispatcher}
            state={state}
        />
    ), el)
})

//dispatcher.dispatch('reset', )
//todoActions.addTodo({name: 'todo-new', id: 333})
todoActions.loadTodos()
