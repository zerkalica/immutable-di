# immutable-di [![Build Status](https://secure.travis-ci.org/zerkalica/immutable-di.png)](http://travis-ci.org/zerkalica/immutable-di)

[![NPM](https://nodei.co/npm/immutable-di.png?downloads=true&stars=true)](https://nodei.co/npm/immutable-di/)

Simple, promise-based dependency injection container with some state handling functions (for facebook flux-like state-management).
For interface docs see [immutable-di.d.ts](./immutable-di.d.ts)

## General
* Install: `npm install --save immutable-di`
* Tests: `npm test`
* Examples: `node examples/run.js [simple, promise, invoker, state]-example.js`
To run immutable-di without transpiler, you need a polyfill for Map and Promise.

## Dictionary
* Definition - factory function or class with meta info
* Meta info - some static array (definition name, dependency, etc), assigned to definition
* Dependency - any definition can have a other definitions as dependency
* State - state object, can be assigned as dependecy to any definition
* Definition name - unique string id for each service
* Promise handler - Each dependency in definition can have a promise handler for modifying promises (catch errors, fail ignore, etc)
* Invoker - invoke handle-method of definition with actionType and payload as arguments (like facebook flux store)
* WaitFor - analog of waitFor in facebook flux dispatcher

## Meta info structure: 
* T.__class = [NameOfDefinition, dep1, dep2, ...]
* or T.__factory = [NameOfDefinition, dep1, dep2, ...]
* dep1..N can be another definition or [definition, promiseHandlerFunction] array

## Usage
To run immutable-di without transpiler, you need a polyfill for Map and Promise.
If transpiler (like [babel](http://babeljs.io/)) used in project, you can include es6 version of immutable di:
```js
//es6-example.js
import {Builder, NativeAdapter} from 'immutable-di/es6'
```

Or include compiled es5 version:
```js
//es5-example.js
var ImmutableDi = require('immutable-di');
var Builder = ImmutableDi.Builder;
var NativeAdapter = ImmutableDi.NativeAdapter;
```

* Builder - function, which returns ImmutableDi instance
* ImmutableDi - function, which returns di container with get, clear and createMethod methods
* NativeAdapter - provide object part by array path for raw object

For additional docs see [immutable-di.d.ts](./immutable-di.d.ts)

## Examples

### Simple example
```js
//simple-example.js
import {Builder, NativeAdapter} from 'immutable-di/es6'
class Logger {
    // babel + playground feature enabled
    static __class = ['Logger']
}

const ImmutableDi = Builder()
const di = ImmutableDi(new NativeAdapter({}))
di.get(Logger).then(logger => console.log(logger instanceof Logger)) // true
```

### Promise example
```js
//promise-example.js
import {Builder, NativeAdapter} from 'immutable-di/es6'
import fs from 'fs'

function Reader(name) {
    return new Promise((resolve, reject) => {
        fs.readFile(name, (err, data) => {
            return err ? reject(err) : resolve(data.toString())
        })
    })
}
Reader.__factory = ['Reader', ['reader', 'name']]

/**
 * di auto resolves promise and return data from Reader
 */
function GetFileData(data) {
    return Promise.resolve(data)
}
GetFileData.__factory = ['GetFileData', Reader];

const state  = {
    reader: {
        name: './test.txt'
    }
}
const ImmutableDi = Builder()
const di = ImmutableDi(new NativeAdapter(state))
di.get(GetFileData)
    .then(data => console.log(data))
    .catch(err => console.log(err.stack))
// test
```

### Class and state example
```js
//state-example.js
import {Builder, NativeAdapter} from 'immutable-di/es6'
const config = {
    logger: {
        level: 'debug'
    }
};

function ConsoleOut() {
    return (message) => console.log(message)
}
ConsoleOut.__factory = ['ConsoleOut']

class Logger {
    // babel + playground feature enabled
    static __class = [
        'Logger',
        ['req', 'query'],
        ['config', 'logger'],
        ConsoleOut
    ]

    constructor(query, config, out) {
        this.query = query
        this.level = config.level
        this.out = out
    }

    warn(message) {
        this.out('[WARN] .' + this.level + '. ' + message + ' (' + this.query + ')')
    }
}
//Use Logger.__class =, if properties in classes is not supported by tsranspiler
//Logger.__class = ['Logger', ['req', 'query'], ['config', 'logger'], ConsoleOut]

// Need for static caching meta-info from di-classes between middleware calls
const ImmutableDi = Builder()

// emulate server call
function middleware(req) {
    const state = {
        req: req,
        config: config
    }

    const di = ImmutableDi(new NativeAdapter(state))

    di.get(Logger)
        .then(logger => logger.warn('test-string'))
        .catch(err => console.log(err.stack))
}

middleware({
    query: 'test-query'
})
// [WARN] .debug. test-string (test-query)
```

### Invoker example
```js
//invoker-example.js
import {Builder, NativeAdapter} from 'immutable-di/es6'
class Store2 {
    static __class = ['Store2', ['registry']]
    constructor(registry) {
        this.registry = registry
    }
    handle(actionType, payload) {
        this.registry.counter++;
        return Promise.resolve({a2: actionType, p2: this.registry.counter})
    }
}

class Store1 {
    static __class = ['Store1', ['registry']]
    static __waitFor = [Store2]
    constructor(registry) {
        this.registry = registry
    }
    handle(actionType, payload) {
        if (this.registry.counter) {
            this.registry.counter++
        }
        return Promise.resolve({a1: actionType, p1: this.registry.counter})
    }
}

const ImmutableDi = Builder()
const di = ImmutableDi(new NativeAdapter({registry: {counter: 0}}))
const method = di.createMethod('testAction', {data: 0})

method.handle(Store1).then(data => console.log(data)) // {a1: 'testAction', p1: 2}
//without static __waitFor = [Store2] Store1 returns p1: 0

method.handle(Store2).then(data => console.log(data)) // {a2: 'testAction', p2: 1}

```
