import './bootstrap'

import React from 'react'
import Container from 'immutable-di'
import NativeCursor from 'immutable-di/cursors/native'
import TodoActions from './todo-actions'
import App from './components/todo-list'
import state from './state'
import __debug from 'debug'
const debug = __debug('immutable-di:flux:index')

const el = document.querySelector('body')

const container = new Container(new NativeCursor(state))

container.once(App.stateMap, state =>
    React.render(<App container={container} />, el)
)

//todoActions.addTodo({name: 'todo-new', id: 333})
container.get(TodoActions).loadTodos()
