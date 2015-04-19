import __bootstrap from './bootstrap'

import React from 'react'
import {ContainerCreator, NativeAdapter, Dispatcher, Define} from '../../src'
import TodoList from './components/todo-list'
import debug from 'debug'

const info = debug('immutable-di:flux:index')

const {Factory, Class, WaitFor, Store} = Define

const el = document.getElementById('app')

class Wrapper extends React.Component {
    static childContextTypes = {
         dispatcher: React.PropTypes.instanceOf(Dispatcher)
    }

    constructor({state, dispatcher, getter, component}) {
        super(state)
        this.state = state
        this._dispatcher = dispatcher
        this._getter = getter
        this._component = component
    }

    getChildContext() {
        return {
            dispatcher: this._dispatcher
        }
    }

    componentDidMount() {
        this._listener = this._dispatcher.mount(
            this._getter,
            (state) => this.setState(state)
        )
    }

    componentWillUnmount() {
        this._dispatcher.unmount(this._listener)
    }

    render() {
        return <this._component {...this.state} />
    }
}

function getter(appState) {
    return appState
}
Factory(getter, ['todoApp'])

class TodoStore {
    handle(state, action, payload) {
        if (this[action]) {
            return this[action].call(this, state, payload)
        }
    }

    loadProgress(state) {
        info('loadProgress')
        state.loading = true

        return state
    }

    loadSuccess(state, todos) {
        info('loadSuccess %o', todos)
        state = todos
        state.loading = false

        return state
    }

    loadFail(state, err) {
        info('loadFail %o', err)
        state.loading = false
        state.error = err

        return state
    }
}

const creator = new ContainerCreator(NativeAdapter)
const dispatcher = new Dispatcher(creator.create())

dispatcher.setStores({
    todoApp: new TodoStore()
})

dispatcher.once(getter, ({getter, state, dispatcher}) => {
    React.render((
        <Wrapper
            dispatcher={dispatcher}
            state={state}
            getter={getter}
            component={TodoList}
        />
    ), el)
})

dispatcher.setState({
    todoApp: {
        loading: false,
        error: null,
        todos: []
    }
})

dispatcher.dispatch('load', Promise.resolve({
    todos: [
        {name: 'todo-1', id: 1},
        {name: 'todo-2', id: 2}
    ]
}))
