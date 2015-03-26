import React from 'react'
import {ContainerCreator, NativeState, ReactRenderer, Dispatcher, Renderer} from '../..'
import PageStore  from './page-store'
import Page from './page.react'

const state = {
    Router: {
        url: 'page'
    },
    Page: {
        status: 'initial',
        todos: [],
        currentTodo: {
            name: 'todo 1',
            text: 'todo text'
        }
    }
}

const stores = [PageStore]
const selector = 'body'
const target = typeof document !== 'undefined' ? document.querySelector(selector) : null
const reactRenderer = new ReactRenderer(React, target)

const containerCreator = new ContainerCreator()

function onReq({req, res, initialState}) {
    const di = containerCreator.create(new NativeState(initialState))

    const router = new Router(req)
    router.onRoute(function onRoute(routeState) {
        di.transformState([{id: 'router', data: routeState}])
            .then(() => di.get(Controllers[routeState.pageId]))
            .then(controller => controller.invoke())
            .catch(err => console.error('render error:', err.message, err.stack()))
    })

    return di.get(Dispatcher)
        .then(dispatcher => dispatcher.setStores(stores).reset())
        .then(() => router.init())
}

function promisify(fn) {
    return options => new Promise(resolve => resolve(fn(options)))
}


promisify(onReq)({req, res, initialState: state})
    .catch(err => console.error('init error:', err.message, err.stack()))
