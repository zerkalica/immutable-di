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

const stores = [PageStore]
const selector = 'body'
const target = typeof document !== 'undefined' ? document.querySelector(selector) : null
const reactRenderer = new ReactRenderer(React, target)

const containerCreator = new ContainerCreator()
const di = containerCreator.create(new NativeState(state)).get

//Fill stores and render page
di(Dispatcher)
    .then(dispatcher => dispatcher.setStores(stores).reset())
    .then(() => di(Renderer))
    .then(renderer => renderer.setAdapter(reactRenderer).render(Page))
    .then(data => console.log('render complete...', data))
    .catch(err => console.error('render error:', err.message, err.stack()))
