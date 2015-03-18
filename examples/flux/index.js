import React from 'react'
import {DiBuilder, NativeState, ReactRenderer} from '../..'
import PageStore  from './page-store'
import Page from './page.react'

const state = new NativeState({
    state: {
        PageStore: {
            status: 'initial',
            todos: [],
            currentTodo: {
                name: 'todo 1',
                text: 'todo text'
            }
        }
    }
})

const builder = DiBuilder([PageStore], new ReactRenderer(React, document.body))

const di = builder(state)
//Fill stores and render page
di.reset()
    .then(() => di.render(Page))
