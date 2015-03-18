import React from 'react'

export default class Page extends React.Component {
    static __deps = ['Page', ['state', 'todos'], ['state', 'currentTodo'], ['state', 'status']]
    static __definition = (todos, currentTodo, status) => ({
        todos,
        status,
        currentTodo,
        todoCount: todos.length
    })

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
                <button class="page__button" onClick={this.props.actions.click}>Click me</button>
            </div>
        )
    }
}
