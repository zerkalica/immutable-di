import React, {PropTypes as p} from 'react'

import __debug from 'debug'
const debug = __debug('immutable-di:flux:TodoList')

import statefull from 'immutable-di/react/statefull'

import TodoActions from '../todo-actions'
import mapIds from '../state/map-ids'
import {TodoItemType} from './todo-item'
import TodoListItem from './todo-list-item'

function mapArrayToObject(arr, keys) {
    const result = {}
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = arr[i]
    }

    return result
}

function PromiseSpread(obj) {
    const keys = Object.keys(obj)
    function map(values) {
        return mapArrayToObject(values, keys)
    }

    return Promise.all(keys.map(k => obj[k])).then(map)
}

function PromiseAssign(cb) {
    return function resolveAssign(obj) {
        return {
            ...obj,
            ...cb(obj)
        }
    }
}

function LoadAll({user, profile, todos}) {
    const {userId} = params
    return PromiseSpread({
        query,
        user: user(userId),
        profile: profile(userId)
    })
    .then(PromiseAssign(d => ({
        todos: todos(d.profile.todoGroupIds[0])
    })))
}
Factory({
    user: userLoader,
    profile: profileLoader,
    todos: todoLoader
})(LoadAll)

@statefull({
    query: Query(schema),
    user: ['user'],
    profile: ['profile'],
    todos: ['todos'],
    mapped: mapIds,
    actions: TodoActions
}, LoadAll)

@statefull({
    todos: Loader(['todoApp', 'todos']),
    query: Query(schema),
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
