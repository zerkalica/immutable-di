import React from 'react'
import PageActions from './page-actions'

class BaseComponent extends React.Component {
    getInitialState() {
        this.__stateHandler = this.props.context.createStateHandler(this.displayName, this.definition)
        if (this.actions) {
            this.actions = this.props.context.get(this.actions)
        }
        return this.__stateHandler.getInitialState()
    }

    componentDidMount() {
        this.__stateHandler.mount(state => this.setState(state))
    }

    componentWillUnmount() {
        this.__stateHandler.unmount()
    }
}

class TodoView extends BaseComponent {
    definition = [
        ['state', 'PageStore', 'currentTodo'],
        ['state', 'PageStore', 'isEditCurrentTodo'],
        currentTodo, isEditCurrentTodo => ({currentTodo, isEditCurrentTodo})
    ]

    render() {
        return (
            <div>
                <h1>TodoView</h1>
                {this.state.isEditCurrentTodo
                    ? <input
                        onChange={this.actions.changeTodoTitle}
                        value={this.state.currentTodo.title}
                        onUnfocus={() => this.actions.editTodoTitle(false)}
                    />
                    : <button
                        onClick={() => this.actions.editTodoTitle(true)}>{this.state.currentTodo.title}</button>
                }

            </div>
        )
    }
}

export default class Page extends BaseComponent {
    definition = [
        ['state', 'PageStore', 'status'],
        status => status
    ]
    actions = PageActions

    render() {
        return (
            <div class="page">
                <h1 class="page__header">Test page</h1>
                <div class="page__status">
                    Status: {this.state.status}
                </div>
                <TodoView context={this.props.context}/>
                <button class="page__button__add" onClick={this.actions.addTodo}>Add empty todo</button>
            </div>
        )
    }
}
