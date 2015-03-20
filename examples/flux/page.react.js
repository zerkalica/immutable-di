import React from 'react'
import PageActions from './page-actions'
import {Context} from '../../src'

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
    static __class = ['Page', {
        actions: PageActions,
        context: Context.Factory('PageContext', Context),
        initialState: Context.Factory('PageProvider', {
            status: ['state', 'PageStore', 'status'],
            currentTodo: ['state', 'PageStore', 'currentTodo'],
            isEditCurrentTodo: ['state', 'PageStore', 'isEditCurrentTodo']
        })
    }]

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

    getInitialState = () => this.props.initialState

    componentDidMount() {
        this.props.context.mount(Page.__class.initialState, state => this.setState(state))
    }

    componentWillUnmount() {
        this.props.context.unmount()
    }

    render = () => this.markup(this.props, this.state)
}
