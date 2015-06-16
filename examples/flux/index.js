import './bootstrap'

import React from 'react'
import {NativeAdapter, Dispatcher, Container} from 'immutable-di'
import TodoActions from './todo-actions'
import TodoList from './components/todo-list'
import state from './state'
import __debug from 'debug'
const debug = __debug('immutable-di:flux:index')

const el = document.querySelector('body')

const container = new Container(new NativeAdapter(state))

container.get(Dispatcher).once(TodoList.stateMap, state => {
    React.render(<TodoList {...state} container={container}/>, el)
})

//dispatcher.dispatch('reset', )
//todoActions.addTodo({name: 'todo-new', id: 333})
container.get(TodoActions).loadTodos()
