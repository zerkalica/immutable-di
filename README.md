immutable-di [![Build Status](https://secure.travis-ci.org/zerkalica/immutable-di.png)](http://travis-ci.org/zerkalica/immutable-di)
====================================================================================================================================

DEPRECATED, use [reactive-di](https://github.com/zerkalica/reactive-di)

[![NPM](https://nodei.co/npm/immutable-di.png?downloads=true&stars=true)](https://nodei.co/npm/immutable-di/)

Simple, dependency injection container with some state handling functions.

General
-------

-	Install: `npm install --save immutable-di immutable-di-react`
-	Tests: `npm test`
-	Examples: `npm run dev.examples`

Why not \*-flux?
----------------

Our main focus make Flux-like API as less and simple as possible. Which with less words you can express more. The ideas behind similar to the [redux](https://github.com/gaearon/redux), [baobab](https://github.com/Yomguithereal/baobab), [nuclear-js](https://github.com/optimizely/nuclear-js), but implementation based on dependency injection. And of course you can use dependency injection as standalone.

Usecases
--------

React all-in example
--------------------

```js
import {default as React, Component} from 'react';
import {Getter, Facet, Factory, Setter} from 'immutable-di/define'
import root from 'immutable-di-react/root'
import statefull from 'immutable-di-react/statefull'
import Container from 'immutable-di'
import NativeCursor from 'immutable-di/cursors/native'

const cursor = new NativeCursor({
  tis: {
    a: 1,
    b: 2
  }
})

const container = new Container(cursor)

var abbaFacet = Facet({
  a: ['tis', 'a']
})(function bloomyFacet({a}) {
  return a + 10;
})


var ChangeAction = Factory({
  setA: Setter(['tis', 'a']),
  setIsLoading: Setter(['tis', 'isLoading'])
})(function ({setA, setIsLoading}) {
  return function (num) {
    // Here will be all mutate state logic. for example server side request
    // communication with API layer and etc.
    setIsLoading(true);
    $.get('/server/route').then((data) => {
      setIsLoading(false);
      var a = num + data.a;
      setA(a);
    })

  }
});

@root()
@statefull({
    abba: abbaFacet,
    changeAction: ChangeAction
})
class Application extends React.Component {
  handleClick () {
    this.props.changeAction(100);
  }
  render () {
    return <div onClick={this.handleClick.bind(this)}>Bloom: {this.props.abba}</div>
  }
}


export default function () {
  React.render(<Application container={container} />, document.querySelector('.app'));
}
```

Define dependency
-----------------

```js
import {Facet, Factory, Class} from 'immutable-di/define'
// A, B - functions or classes with di definitions

// For functions:
Factory([A, B])(C) // resolve functions A, B and pass them as arguments to C
Factory({a: A, b: B})(C) // resolve functions A, B and pass them as object {a, b} to C

//Facet - same as Factory, but do not cache factory return value

// For classes:
@Class([A, B])
class C {
    constructor(a, b) {

    }
}

// or
class C {
    constructor(a, b) {

    }
}

export default Class([A, B])(C)

// or
@Class({
    a: A,
    b: B
})
class C {
    constructor({a, b}) {
    }
}

// for State
@Class([
    A,
    B,
    options: ['config', 'c']
])
class C {
    constructor(a, b, options) {

    }
}
```

Working with state
------------------

```js
import Container from 'immutable-di'
import NativeCursor from 'immutable-di/cursors/native'

const cursor = new NativeCursor({
    config: {
        logger: {
            opt1: 'test1'
        },
        mod2: {
            opt1: 'test2'
        }
    }
})

// define di container with state:
const container = new Container(cursor)

// dep 1:
function MyFaset(state) {
    return 'data'
}
Factory()(MyFaset)

// dep 2:
function myHandler({state, faset}) {
    console.log(state, faset)
}

// bind listener:
const listener = container.on({
    state: ['config', 'logger'],
    faset: MyFaset
}, myHandler)

// trigger my hander
cursor.select(['config', 'logger', 'opt1']).set('test')

// path config.logger not affected, myHandler is not triggered
cursor.select(['config', 'mod2', 'opt1']).set('1')

// unbind listener:
container.off(listener)
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

React example
-------------

```js
// my-faset.js
function myFaset(todos) {
    return todos.map(todo => todo.id + '-mapped')
}

export default Factory([
    ['todoApp', 'todos']
])(myFaset)
```

```js
// todo-list.js
import statefull from 'immutable-di-react/statefull'
import root from 'immutable-di-react/root'
import TodoListItem from './todo-list-item'
import myFaset from './my-faset'
import TodoActions from './todo-actions'

// set container from props to context:
@root()
// bind to setState:
@statefull({
    todos: ['todoApp', 'todos'], // state path
    query: ['todoApp', 'query'], // state path
    mapped: myFaset, // faset
    actions: TodoActions // class with actions
})
export default class TodoList extends React.Component {
    render({todos, mapped, actions}) {
        return (
            <div>
                <div>
                    <h3>Mapped todo ids:</h3>
                    {mapped.toString()}
                </div>
                <ul>
                    {todos.map(todo => (
                        <TodoListItem todo={todo}/>
                    ))}
                </ul>
            </div>
        )

    }
}
```

```js
// todo-list-item.js
import React from 'react'
import widget from 'immutable-di-react/widget'
import di from 'immutable-di-react/di'
import TodoActions from './todo-actions'

function TodoListItem({todo, editMode, actions}) {
    return (
        <li className='todos-list-item'>
            {todo.title}
        </li>
    )
}

export default Di({
    actions: TodoActions
})(widget(TodoListItem))
```

```js
// todo-actions.js
import Container from 'immutable-di'
import {Class} from 'immutable-di/define'

@Class([Container])
export default class TodoActions {
    constructor(container) {
        this._cursor = cursor.select(['todoApp'])
    }

    addTodo(todo) {
        this._cursor.apply(['todos'] => todos.concat(todo))
    }
}
```

```js
// index.js
import React from 'react'
import Container from 'immutable-di'
import NativeCursor from 'immutable-di/cursors/native'
import TodoList from './todo-list'

// define di container with state:
const cursor = new NativeCursor({
    todoApp: {
        todos: [],
        query: {

        }
    }
})
const container = new Container(cursor)

const initialProps = cursor.select(['todoApp']).get()
React.render(<TodoList ...initialProps container={container}/>, document.querySelector('body'))
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
