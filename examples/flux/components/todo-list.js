import React, {PropTypes as p, Component} from 'react'
import {Class, Getter, Factory} from '../../../src/define'

import TodoActions from '../todo-actions'

import __debug from 'debug'
const debug = __debug('immutable-di:flux:TodoList')

class TodoItem extends Component {
    static propTypes = {
        editMode: p.bool,
        todo: p.shape({
            id: p.number.isRequired,
            title: p.string.isRequired,
            description: p.string
        }).isRequired
    }

    static contextTypes = {
        actions: p.instanceOf(TodoActions).isRequired,
        get: p.func.isRequired
    }

    constructor(state, context) {
        super(state, context)
        this.state = {title: this.props.todo.title}
    }

    render() {
        const {todo, editMode} = this.props
        const {id, title, description} = todo
        const actions = this.context.actions

        return (
            <div className='todo_item'>
                {editMode ? (
                    <div className ='todo_item-body'>
                        <h3 className='todo_item-title'>
                            {title}
                        </h3>
                        <button className='todo_item-edit_button' onClick={() => actions.editTodo(id)}>
                            Edit
                        </button>
                    </div>
                 ) : (
                    <div className ='todo_item-body-edit'>
                        <input type='text' className='todo_item-title__edit' value={title}
                            onChange={e => this.setState({title: e.target.value})}
                        />
                        <button
                            className="todo_item-save_button"
                            onClick={() => actions.saveTodo(merge(todo, {
                                title: this.state.title
                            }))}
                        >
                            Save
                        </button>
                    </div>
                )}

                <div className='todo_item-description'>
                    {description}
                </div>

                <button
                    className='todo_item-del_button'
                    onClick={() => actions.deleteTodo(id)}
                >
                    Remove
                </button>
            </div>
        )
    }
}

class TodoListItem extends Component {
    static propTypes = TodoItem.propTypes

    render() {
        const {todo, editMode} = this.props
        return (
            <li className='todos-list-item'>
                <TodoItem todo={todo} editMode={editMode} />
            </li>
        )
    }
}

class StateComponent extends Component {
    constructor(props, context) {
        super(props, context)
        this.props = context.get(this.constructor, props)
    }

    static contextTypes = {
        get: p.func.isRequired,
        actions: p.object.isRequired
    }
}

function getMappedTodos({todos}) {
    return todos.map(todo => Object.assign(todo, {extId: todo.id + '!!!'}))
}
Factory(getMappedTodos, {
    todos: 'todoApp.todos'
})

export default class TodoList extends StateComponent {
    static propTypes = {
        todos: p.arrayOf(TodoItem.propTypes.todo).isRequired,
        query: p.shape({
            sortField: p.oneOf(['title', 'description']),
            sortDirection: p.oneOf(['asc', 'desc'])
        })
    }

    render() {
        const {todos, editId, loading, query} = this.props
        const actions = this.context.actions
        debug('len: %s, loading: %s', todos.length, loading)

        return (
            <div className='todos'>
                <h1 className='todos-title'>Todos</h1>

                <button
                    className='todos-add_button'
                    onClick={() => actions.addTodo({
                        title: 'example todo',
                        id: todos.length + 1,
                        description: 'qwewe'
                    })}
                >
                    Add todo
                </button>

                <ul className='todos-list'>
                    {todos.map(todo => (
                        <TodoListItem todo={todo} key={todo.id} editMode={editId === todo.id} />
                    ))}
                </ul>
            </div>
        )
    }
}
Class(TodoList)
Getter(TodoList, {
    todos: 'todoApp.todos',
    query: 'todoApp.query',
    calculated: getMappedTodos
})
