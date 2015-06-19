import React from 'react'
import di from 'immutable-di/react/di'
import widget from 'immutable-di/react/widget'
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

export default di({
    actions: TodoActions
})(widget(TodoListItem))
