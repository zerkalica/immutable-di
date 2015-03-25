import React from 'react'
import PageActions from './page-actions'
import {Define} from '../../src'

class TodoView extends React.Component {
    render() {
        const {isEdit, todo} = this.props
        const actions = this.props.actions
        return (
            <div>
                <h1>TodoView</h1>
                {isEditCurrentTodo
                    ? <input
                        value={currentTodo.title}
                        onChange={() => actions.editTodoTitleComplete()}
                    />
                    : <button
                        onClick={() => actions.editTodoTitleStart()}>{currentTodo.title}</button>
                }

            </div>
        )
    }
}

export default class Page extends React.Component {
    constructor({props, state, updater}) {
        super(props)
        this.state = state
        this._updater = updater
    }

    componentDidMount() {
        this._updater.mount(state => this.setState(state))
    }

    componentWillUnmount() {
        this.updater.unmount()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState
    }

    render() {
        return this.markup(this.props, this.state)
    }

    markup = ({actions}, {currentTodo, isEditCurrentTodo, status}) => (
        <div class="page">
            <h1 class="page__header">Test page</h1>
            <div class="page__status">
                Status: {status}
            </div>
            <TodoView todo={currentTodo} isEdit={isEditCurrentTodo} actions={actions}/>
            <button class="page__button__add" onClick={actions.addTodo}>Add empty todo</button>
        </div>
    )
}

Define.Statefull(Page, {
    state: {
        status: 'PageStore.status',
        currentTodo: 'PageStore.currentTodo',
        isEditCurrentTodo: 'PageStore.isEditCurrentTodo'
    },
    props: {
        actions: PageActions,
        dispatcher: Dispatcher,
        config: 'config.Page'
    }
})
