import React, {PropTypes as p} from 'react'

import __debug from 'debug'
const debug = __debug('immutable-di:flux:TodoList')

import root from 'immutable-di/react/root'
import statefull from 'immutable-di/react/statefull'

import TodoActions from '../todo-actions'
import mapIds from '../state/map-ids'
import {TodoItemType} from './todo-item'
import TodoListItem from './todo-list-item'

@root
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
        const {todos, editId, loading, actions, mapped} = this.props
        debug('len: %s, loading: %s', todos.length, loading)

        return (
            <div className="todos">
                <h1 className="todos-title">Todos</h1>

                <button
                    className="todos-add_button"
                    onClick={() => actions.addTodo({
                        title: 'example todo',
                        id: todos.length + 11,
                        description: 'qwewe'
                    })}
                >
                    Add todo
                </button>
                {mapped.toString()}

                <ul className="todos-list">
                    {todos.map(todo => (
                        <TodoListItem
                            key={todo.id}
                            todo={todo}
                            editMode={editId === todo.id}
                        />
                    ))}
                </ul>
            </div>
        )
    }
}
