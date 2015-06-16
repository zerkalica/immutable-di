import React from 'react'
import Widget from 'immutable-di/react/widget'
import Di from 'immutable-di/react/di'
import TodoItem from './todo-item'
import TodoActions from '../todo-actions'

function TodoListItem({todo, editMode, actions}) {
    return (
        <li className='todos-list-item'>
            {typeof actions}
            <TodoItem
                todo={todo}
                editMode={editMode}
            />
        </li>
    )
}

export default Di({
    actions: TodoActions
})(Widget(TodoListItem))
