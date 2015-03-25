//invoker-example.js
import {ContainerCreator, NativeAdapter, Define} from '../src'
class Store2 {
    constructor(registry) {
        this.registry = registry
    }
    handle(actionType, payload) {
        this.registry.counter++;
        return Promise.resolve({a2: actionType, p2: this.registry.counter})
    }
}
Define.Class(Store2, ['registry'])

class Store1 {
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
Define.Class(Store1, ['registry'])
Define.WaitFor(Store1, [Store2])

const containerCreator = new ContainerCreator()
const di = containerCreator.create(new NativeAdapter({registry: {counter: 0}}))
const method = di.createMethod('testAction', {data: 0})

method.handle(Store1).then(data => console.log(data)) // {a1: 'testAction', p1: 2}
//without static __waitFor = [Store2] Store1 returns p1: 0

method.handle(Store2).then(data => console.log(data)) // {a2: 'testAction', p2: 1}
