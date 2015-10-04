immutable-di [![Build Status](https://secure.travis-ci.org/zerkalica/immutable-di.png)](http://travis-ci.org/zerkalica/immutable-di)
====================================================================================================================================

[![NPM](https://nodei.co/npm/immutable-di.png?downloads=true&stars=true)](https://nodei.co/npm/immutable-di/)

Simple, dependency injection container with some state handling functions.

General
-------

-	Install: `npm install --save immutable-di`
-	Tests: `npm test`

Why not \*-flux?
----------------

Our main focus make Flux-like API as less and simple as possible. Which with less words you can express more. The ideas behind similar to the [redux](https://github.com/gaearon/redux), [baobab](https://github.com/Yomguithereal/baobab), [nuclear-js](https://github.com/optimizely/nuclear-js), but implementation based on dependency injection. And of course you can use dependency injection as standalone.

Usecases
--------

Working with state
------------------

```js
import Container from 'immutable-di'
import AbstractCursor from 'immutable-di/cursors/AbstractCursor'
import {Factory} from 'immutable-di/define'

// tcomb is optional validation layer
import {struct, list, maybe, Num, Bool, Str} from 'tcomb'
import createTcombValidator from 'immutable-di/validate/tcomb/createTcombValidator'

// For ide autocomplete
type IUser = {
    name: string,
    email: ?string,
    todoIds: Array<number>
}

const userModel = {
    // optional tcomb schema vor validating state data
    schema: struct({
        name: Str,
        email: maybe(Str),
        todoIds: list(Num)
    }),
    // initial values for model
    defaults: {
        name: 'John doe',
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
    title: string,
    isCompleted: bool
}
type ITodos = Array<ITodo>

const TodoModel = {
    schema: struct({
        todos: list(struct({
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

const container = new Container({
    stateSpec: {
        user: UserModel
    },
    createValidator: createTcombValidator
})

const UserCursor = UserModel.$
const TodoCursor = TodoModel.$

function GetUserFullName(
    {name, email}: {name: string, email: ?string}
): string {
    return name + email ? (' (' + email + ')') : ''
}

const getUserFullName = Factory({
    name: UserCursor.name,
    email: UserCursor.email
})(GetUserFullName)

function GetUserTodos(
    {todoIds, todos}: {todoIds: Array<number>, todos: Array<ITodos>}
) {
    return todoIds.map(id => todos[id])
}

const getUserTodos = Factory({
    todoIds: UserCursor.todoIds,
    todos: TodoCursor.todos
})(GetUserTodos)


function ShowUserInfo(
    {fullName, todos}: {fullName: string, todos: Array<ITodos>}
): void {
    console.log('fullName', fullName, 'todos', JSON.serialize(todos, null, '  '))
}

const showUserInfo = Factory({
    fullName: getUserFullName,
    todos: getUserTodos
})(ShowUserInfo)

function AddTodo(
    todosCursor: AbstractCursor<Array<Itodo>>,
    userTodosCursor: AbstractCursor<Array<number>>
): (rec: ITodo) => void {
    return function addTodo({title, isCompleted}) {
        const id = todoCursor.get().length
        todosCursor.apply(todos => todos.concat({title, isCompleted}))
        userTodosCursor.apply(todoIds => todoIds.concat(id))
    }
}

const addTodo = Factory([
    TodoCursor.todos.$,
    UserCursor.todoIds.$
])(AddTodo)

function ChangeUserName(
    userName: AbstractCursor<string>,
    userEmail: AbstractCursor<string>
) {
    return function changeUserName(
        {name, email}: {name: string, email: ?string}
    ) {
        userName.set(name)
        userEmail.set(email)
    }
}

const changeUserName = Factory([
    UserCursor.name.$,
    UserCursor.email.$
])(ChangeUserName)

container.mount(showUserInfo)

container.get(addTodo)({
    title: 'todo title',
    isCompleted: false
})

container.get(changeUserName)({
    name: 'User 2',
    email: 'test@tt.ru'
})

container.unmount(showUserInfo)

```

Di factory example
------------------

```js
import Container from 'immutable-di'
import {Factory, Class} from 'immutable-di/define'
import NativeCursor from 'immutable-di/cursors/native'

const cursor = new NativeCursor({
    config: {
        logger: {
            opt1: 'test1'
        }
    }
})
const container = new Container(cursor)

function ConsoleOutputDriver() {
    return function consoleOutputDriver(str) {
        console.log(str)
    }
}
Factory()(ConsoleOutputDriver)

@Class([
    ConsoleOutputDriver,
    ['config', 'logger']
])
class Logger {
    constructor(outputDriver, dep, config) {
        this._outputDriver = outputDriver
        this._config = config
    }
    log(val) {
        this._outputDriver('val:' + val + ', opt:' + this._config.opt1)
    }
}

function SomeDep() {
    return 'dep'
}
Factory()(SomeDep)

function App({logger, someDep}) {
    return function app(val) {
        logger.log(val + someDep)
    }
}
Factory({
    logger: logger,
    someDep: SomeDep
})(App)

container.get(App)('test') // outputs: val: testdep, opt: test1
```

Cache example
-------------

```js
import Container from 'immutable-di'
import {Factory, Class} from 'immutable-di/define'
import NativeCursor from 'immutable-di/cursors/native'

const cursor = new NativeCursor({
    config: {
        myModule: {
            opt1: 'test1'
        }
    }
})
const container = new Container(cursor)

function MyModule({opt1}) {
    console.log('init', opt1)

    return function myModule(val) {
        console.log('out', opt1, ', val', val)
    }
}
Factory([
    ['config', 'myModule']
])(MyModule)

container.get(MyModule) // outputs init test1
container.get(MyModule) // no outputs, return from cache
const cursor = cursor.select(['config', 'myModule', 'opt1'])

cursor.set('test2') // outputs test2
container.get(MyModule) // no outputs: return from cache

container.get(MyModule)('test3') // outputs out test2, val test3
```

Initial debug support
---------------------

```js
import {Factory, Setter} from 'immutable-di/define'
import Container from 'immutable-di'
import NativeCursor from 'immutable-di/cursors/native'
import MonitorFactory from 'immutable-di/history/MonitorFactory'

Factory.extend = MonitorFactory

function showChanges(history) {
    console.log(history)
}

const action = Factory([
    Setter(['tis', 'a'])
])(function MyAction(setA) {
    return function myAction(value) {
        setA(value)
    }
})

const cursor = new NativeCursor({
    tis: {
        a: 1,
        b: 2
    }
})
const container = new Container(cursor)
const listener = container.on([
    ['__history']
], showChanges)

container.get(action)(123)
// Will produce:
/*
[
    { "displayName": "MyAction", "id": 11, "args": [ 123 ], "diff": {} }
]
*/
container.off(listener)
```

NativeCursor:diff used for diff generation, this dummy, but NativeCursor can be extended.
