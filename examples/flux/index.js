import './bootstrap'

import React from 'react'
import Container from 'immutable-di'
import NativeCursor from 'immutable-di/cursors/native'
import App from './components/todo-list'
import state from './state'

const el = document.querySelector('body')
const container = new Container(new NativeCursor(state))
React.render(<App container={container} />, el)
