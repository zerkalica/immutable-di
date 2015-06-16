import React, {PropTypes as p, Component} from 'react'

import __debug from 'debug'
const debug = __debug('immutable-di:flux:TodoList')

import statefull from 'immutable-di/react/statefull'
import {Factory} from 'immutable-di/define'

import TodoActions from '../todo-actions'
import mapIds from '../state/map-ids'
import TodoItem, {TodoItemType} from './todo-item'

@statefull({
    todos: ['todoApp', 'todos'],
    query: ['todoApp', 'query'],
    mapped: mapIds,
    actions: TodoActions
})
export default class TodoList extends React.Component {
    static propTypes = {
        todos: p.arrayOf(TodoItemType).isRequired,
        query: p.shape({
            sortField: p.oneOf(['title', 'description']),
            sortDirection: p.oneOf(['asc', 'desc'])
        }),
        mapped: p.arrayOf(p.string.isRequired),
        actions: p.instanceOf(TodoActions)
    }

    render() {
        const {todos, editId, loading, query, actions, mapped} = this.props
        debug('len: %s, loading: %s', todos.length, loading)

        return (
            <div className='todos'>
                <h1 className='todos-title'>Todos</h1>

                <button
                    className='todos-add_button'
                    onClick={() => actions.addTodo({
                        title: 'example todo',
                        id: todos.length + 11,
                        description: 'qwewe'
                    })}
                >
                    Add todo
                </button>
                {mapped.toString()}

                <ul className='todos-list'>
                    {todos.map(todo => (
                        <li className='todos-list-item' key={todo.id}>
                            <TodoItem
                                todo={todo}
                                editMode={editId === todo.id}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        )
    }
}
