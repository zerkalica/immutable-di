import React from 'react'
import PageActions from './page-actions'

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
    static props = {
        actions: PageActions,
        dispatcher: Dispatcher,
        config: 'config.Page'
    }
    static state = {
        status: 'PageStore.status',
        currentTodo: 'PageStore.currentTodo',
        isEditCurrentTodo: 'PageStore.isEditCurrentTodo'
    }

    constructor({props, state, updater}) {
        super(props)
        this.state = state
        this._updaterDefinition = updater(state => this.setState(state))
    }

    componentDidMount() {
        this.props.dispatcher.mount(this._updaterDefinition)
    }

    componentWillUnmount() {
        this.props.dispatcher.unmount(this._updaterDefinition)
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

Annotate.Statefull(Page)
