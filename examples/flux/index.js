import __polyfill from 'babel-core/polyfill'

import React from 'react'
import {ContainerCreator, NativeAdapter, Dispatcher, Define} from '../../src'
import TodoList from './components/todo-list'

const {Factory, Class, WaitFor, Store} = Define

const el = document.getElementById('app')

class Wrapper extends React.Component {
    static childContextTypes = {
         dispatcher: React.PropTypes.instanceOf(Dispatcher)
    }

    constructor(options) {
        super(options.state)
        this.state = options.state
        this._dispatcher = options.dispatcher
        this._getter = options.getter
        this._component = options.component
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
    handle(action, payload) {
        return this[action] && this[action].call(this, payload)
    }

    load(payload) {
        //progress
    }

    loadSuccess(state) {
        return state
    }

    loadFail(err) {
        return err
    }
}
Store(TodoStore, 'todoApp')

const dispatcher = new Dispatcher(
    (new ContainerCreator()).create(new NativeAdapter())
)

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
        todos: [
            {name: 'todo-1', id: 1},
            {name: 'todo-2', id: 2}
        ]
    }
}

dispatcher.dispatch('load', Promise.resolve(initialState))
