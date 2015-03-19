import React from 'react'
import PageActions from './page-actions'

class BaseComponent extends React.Component {
    constructor(options) {
        super(options.props)
        this.context = options.context
        this.actions = options.actions
    }

    componentDidMount() {
        this.context.mount()
    }

    componentWillUnmount() {
        this.context.unmount()
    }
}

class StatefullBaseComponent extends React.Component {
    constructor(options) {
        super(options.props)
        this.context = options.context
        this.actions = options.actions
        this.state = options.props
    }

    componentDidMount() {
        this.context.mount(state => this.setState(state))
    }

    componentWillUnmount() {
        this.context.unmount()
    }
}

class TodoView extends BaseComponent {
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

export default class Page extends BaseComponent {
    static definition = [
        ['state', 'PageStore', 'status'],
        ['state', 'PageStore', 'currentTodo'],
        ['state', 'PageStore', 'isEditCurrentTodo'],
        (status, currentTodo, isEditCurrentTodo) => ({isEditCurrentTodo, currentTodo, status})
    ]
    static actions = PageActions

    render() {
        const {currentTodo, isEditCurrentTodo, status} = this.props
        const actions = this.actions
        return (
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
}
