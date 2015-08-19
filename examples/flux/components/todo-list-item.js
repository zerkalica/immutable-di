import React from 'react'
import TodoItem from './todo-item'
import TodoActions from '../todo-actions'

export default class TodoListItem extends React.Component {
    render() {
        const {todo, editMode} = this.props

        return (
            <li className="todos-list-item">
                <TodoItem
                    todo={todo}
                    editMode={editMode}
                />
            </li>
        )
    }
}
