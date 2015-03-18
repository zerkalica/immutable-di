import React from 'react'
import PageActions from './page-actions'

export default class Page extends React.Component {
    static __deps = ['Page', ['state', 'todos'], ['state', 'currentTodo'], ['state', 'status']]
    static __definition = (todos, currentTodo, status) => ({
        todos,
        status,
        currentTodo,
        todoCount: todos.length
    })
    static __actions = PageActions

    getInitialState() {
        return this.props.stateHandler.getInitialState()
    }

    componentDidMount() {
        this.props.stateHandler.mount(state => this.setState(state))
    }

    componentWillUnmount() {
        this.props.stateHandler.unmount()
    }

    render() {
        return (
            <div class="page">
                <h1 class="page__header">Test page</h1>
                <div class="page__status">
                    Status: {this.state.status}
                </div>
                <button class="page__button__add" onClick={this.props.actions.addTodo}>Add empty todo</button>
            </div>
        )
    }
}
