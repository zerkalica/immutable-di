import React from 'react'
import {ContainerCreator, NativeState, ReactRenderer, Dispatcher, Renderer} from '../..'
import PageStore  from './page-store'
import Page from './page.react'

const state = {
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
}

const selector = 'body'
const target = typeof document !== 'undefined' ? document.querySelector(selector) : null
const containerCreator = new ContainerCreator({
    stores: [PageStore],
    renderer: new ReactRenderer(React, target)
})

const di = containerCreator.create(new NativeState(state)).get

//Fill stores and render page
di(Dispatcher)
    .then(dispatcher => dispatcher.reset())
    .then(() => di(Renderer))
    .then(renderer => renderer.render(Page))
    .then(() => console.log('render complete...'))
    .catch(err => console.error('render error:', err.message, err.stack()))
