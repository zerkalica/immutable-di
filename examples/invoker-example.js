//invoker-example.js
import {Builder, NativeAdapter} from '../src'
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
