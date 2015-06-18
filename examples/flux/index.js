import './bootstrap'

import React from 'react'
import Container from 'immutable-di'
import NativeCursor from 'immutable-di/cursors/native'
import TodoActions from './todo-actions'
import TodoList from './components/todo-list'
import state from './state'
import __debug from 'debug'
const debug = __debug('immutable-di:flux:index')

const el = document.querySelector('body')

const container = new Container(new NativeCursor(state))

container.once(TodoList.stateMap, state => {
    React.render(<TodoList {...state} container={container}/>, el)
})

//dispatcher.dispatch('reset', )
//todoActions.addTodo({name: 'todo-new', id: 333})
container.get(TodoActions).loadTodos()
