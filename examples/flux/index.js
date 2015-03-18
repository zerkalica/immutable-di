import React from 'react'
import {DiBuilder, NativeState, ReactRenderer} from '../..'
import Store  from './store'
import Page from './page.react'

const state = new NativeState({
    state: {
        page: {
            status: 'initial',
            todos: [],
            currentTodo: {
                name: 'todo 1',
                text: 'todo text'
            }
        }
    }
})

const builder = DiBuilder([Store], new ReactRenderer(React, document.body))

const di = builder(state)

di.render(Page)
