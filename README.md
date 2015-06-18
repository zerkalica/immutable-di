# immutable-di [![Build Status](https://secure.travis-ci.org/zerkalica/immutable-di.png)](http://travis-ci.org/zerkalica/immutable-di)

[![NPM](https://nodei.co/npm/immutable-di.png?downloads=true&stars=true)](https://nodei.co/npm/immutable-di/)

Simple, dependency injection container with some state handling functions.

## General
* Install: `npm install --save immutable-di`
* Tests: `npm test`
* Examples: `npm run dev.examples`

## Define dependency
```js
import {Factory, Class} from 'immutable-di/define'
// A, B - functions or classes with di definitions

// For functions:
Factory([A, B])(C) // resolve functions A, B and pass them as arguments to C
Factory({a: A, b: B})(C) // resolve functions A, B and pass them as object {a, b} to C

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

## Working with state
```js
const container = new Container(new NativeCursor({
    config: {
        logger: {
            opt1: 'test1'
        }
    }
}))

function MyFaset(state) {
    return 'data'
}
Factory()(MyFaset)

function myHandler({state, faset}) {
    console.log(state, faset)
}

const listener = container.on({
    state: ['config', 'logger'],
    faset: MyFaset
}, myHandler)

container.select(['config']).set(['logger', 'opt1'], 'test') // trigger my hander

container.off(listener)
```

## Di factory example
```js
import Container from 'immutable-di'
import {Factory, Class} from 'immutable-di/define'
import NativeCursor from 'immutable-di/cursors/native'
const container = new Container(new NativeCursor({
    config: {
        logger: {
            opt1: 'test1'
        }
    }
}))

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

## Cache example
```js
import Container from 'immutable-di'
import {Factory, Class} from 'immutable-di/define'
import NativeCursor from 'immutable-di/cursors/native'
const container = new Container(new NativeCursor({
    config: {
        myModule: {
            opt1: 'test1'
        }
    }
}))

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
container
    .select(['config', 'myModule'])
    .set(['opt1'], 'test2') // outputs test2
container.get(MyModule) // no outputs: return from cache

container.get(MyModule)('test3') // outputs out test2, val test3
```

## React example

```js
import statefull from 'immutable-di/react/statefull'
@statefull({
    todos: ['todoApp', 'todos'],
    query: ['todoApp', 'query'],
    mapped: mapIds, // faset
    actions: TodoActions // class with actions
})
export default class TodoList extends React.Component {
    render() {
        const {todos, query, mapped, actions} = this.props
    }
}
```

## Simple react widget

```js

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

```
