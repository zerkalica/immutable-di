import React, {PropTypes as p, Component} from 'react'
import TodoActions from '../todo-actions'
import di from 'immutable-di/react/di'
import __debug from 'debug'
const debug = __debug('immutable-di:flux:todo-item')

export const TodoItemType = p.shape({
    id: p.number.isRequired,
    title: p.string.isRequired,
    description: p.string
})

@di({
    actions: TodoActions
})
export default class TodoItem extends Component {
    static propTypes = {
        editMode: p.bool,
        todo: TodoItemType.isRequired,
        actions: p.instanceOf(TodoActions).isRequired
    }

    render({todo, editMode, actions}) {
        const {id, title, description} = todo
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
                            onChange={e => actions.setTodo(id, {
                                title: e.currentTarget.value
                            })}
                        />
                        <button
                            className="todo_item-save_button"
                            onClick={() => actions.saveTodo(Object.assign({}, todo, {
                                title: '123'
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

