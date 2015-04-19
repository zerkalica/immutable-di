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
        return this[action] && this[action].call(this, state, payload)
    }

    loadProgress(state) {
        info('loadProgress')
        return {
            loading: true
        }
    }

    loadSuccess(state, todos) {
        info('loadSuccess %o', todos)
        return {
            loading: false,
            todos
        }
    }

    loadFail(state, err) {
        info('loadFail %o', err)
        return {
            loading: false,
            error: err
        }
    }
}
Store(TodoStore, 'todoApp')

const creator = new ContainerCreator(NativeAdapter)
const dispatcher = new Dispatcher(creator.create())

dispatcher.setStores([TodoStore])

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

const initialState = {
    todoApp: {
        loading: false,
        error: null,
        todos: []
    }
}

dispatcher.dispatch('chargeStore', storeId => initialState[storeId])
dispatcher.dispatch('load', Promise.resolve({
    todos: [
        {name: 'todo-1', id: 1},
        {name: 'todo-2', id: 2}
    ]
}))
