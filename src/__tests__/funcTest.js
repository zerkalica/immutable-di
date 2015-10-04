import Container from '../Container'
import AbstractCursor from '../cursors/AbstractCursor'
import {Factory} from '../define'

// tcomb is optional validation layer
import {struct, list, maybe, Num, Bool, Str} from 'tcomb'
import createTcombValidator from '../validate/tcomb/createTcombValidator'

import sinon from 'sinon'
import assert from 'power-assert'

// For ide autocomplete
type IUser = {
    name: string,
    email: ?string,
    todoIds: Array<number>
}

const UserModel = {
    // optional tcomb schema vor validating state data
    schema: struct({
        name: Str,
        email: maybe(Str),
        todoIds: list(Num)
    }),
    // initial values for model
    defaults: {
        name: 'John Doe',
        email: 'john@example.com',
        todoIds: []
    },
    // Cursors needed for ide autocompetion
    // all $ points to AbstractCursor instances binded to according state path
    // all names points to data parts in state
    $: {
        $: {},
        name: {$: {}},
        email: {$: {}},
        todoIds: {$: {}}
    }
}


type ITodo = {
    id: number,
    title: string,
    isCompleted: bool
}
type ITodos = Array<ITodo>

const TodoModel = {
    schema: struct({
        todos: list(struct({
            id: Num,
            title: Str,
            isCompleted: Bool
        }))
    }),

    defaults: {
        todos: []
    },

    $: {
        $: {},
        todos: {$: {}}
    }
}

const UserCursor = UserModel.$
const TodoCursor = TodoModel.$

function GetUserFullName(
    {name, email}: {name: string, email: ?string}
): string {
    return name + (email ? (' (' + email + ')') : '')
}
const getUserFullName = Factory({
    name: UserCursor.name,
    email: UserCursor.email
})(GetUserFullName)

function GetUserTodos(
    {todoIds, todos}: {todoIds: Array<number>, todos: Array<ITodos>}
) {
    return todos.filter(todo => todoIds.indexOf(todo.id) !== -1)
}

const getUserTodos = Factory({
    todoIds: UserCursor.todoIds,
    todos: TodoCursor.todos
})(GetUserTodos)

function AddTodo(
    todoCursor: AbstractCursor<Array<Itodo>>,
    userTodosCursor: AbstractCursor<Array<number>>
): (rec: ITodo) => void {
    let lastId = 1
    return function addTodo({title, isCompleted}) {
        const id = lastId++
        todoCursor.apply(todos => todos.concat({id, title, isCompleted}))
        userTodosCursor.apply(todoIds => todoIds.concat(id))
    }
}

const addTodo = Factory([
    TodoCursor.todos.$,
    UserCursor.todoIds.$
])(AddTodo)

function ChangeUserName(
    user: AbstractCursor<IUser>
) {
    return function changeUserName(
        {name, email}: {name: string, email: ?string}
    ) {
        user.assign({name, email})
    }
}

const changeUserName = Factory([
    UserCursor.$
])(ChangeUserName)

function SetCompleted(
    todosCursor: AbstractCursor<Array<ITodo>>
) {
    return function setCompleted(id, isCompleted) {
        todosCursor.apply(todos => todos.map(todo =>
            todo.id === id
            ? {...todo, isCompleted}
            : todo
        ))
    }
}
const setIsCompleted = Factory([TodoCursor.todos.$])(SetCompleted)

describe('funcTest', () => {
    it('should update state', () => {
        function ShowUserInfo(
            {fullName, todos}: {fullName: string, todos: Array<ITodos>}
        ): void {
            // console.log('fullName:', fullName, '\ntodos:', JSON.stringify(todos, null, '  '))
        }

        const showUserInfo = Factory({
            fullName: getUserFullName,
            todos: getUserTodos
        })(sinon.spy(ShowUserInfo))

        const container = new Container({
            stateSpec: {
                user: UserModel,
                todos: TodoModel
            },
            isSynced: true,
            createValidator: createTcombValidator
        })

        container.mount(showUserInfo)

        container.get(addTodo)({
            title: 'todo title',
            isCompleted: false
        })
        // State updates in synced, addTodo writes to todoCursor and UserTodoCursor
        // first update: todoCursor.apply(todos => todos.concat({id, title, isCompleted}))
        assert(showUserInfo.getCall(0).calledWith({
            fullName: 'John Doe (john@example.com)',
            todos: []
        }))
        // second update: userTodosCursor.apply(todoIds => todoIds.concat(id))
        assert(showUserInfo.getCall(1).calledWith({
            fullName: 'John Doe (john@example.com)',
            todos: [
                {
                    id: 1,
                    title: 'todo title',
                    isCompleted: false
                }
            ]
        }))

        container.get(changeUserName)({
            name: 'User 2',
            email: 'test@tt.ru'
        })
        assert(showUserInfo.getCall(2).calledWith({
            fullName: 'User 2 (test@tt.ru)',
            todos: [
                {
                    id: 1,
                    title: 'todo title',
                    isCompleted: false
                }
            ]
        }))

        container.get(setIsCompleted)(1, true)
        assert(showUserInfo.getCall(3).calledWith({
            fullName: 'User 2 (test@tt.ru)',
            todos: [
                {
                    id: 1,
                    title: 'todo title',
                    isCompleted: true
                }
            ]
        }))

        assert.throws(() => {
            container.get(changeUserName)({
                name: 123123,
                email: 'test@tt.ru'
            })
        }, /Invalid value 123123 supplied to String/)

        container.unmount(showUserInfo)
        assert(showUserInfo.callCount === 4)
    })
})
