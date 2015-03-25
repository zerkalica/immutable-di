//simple-example.js
import {ContainerCreator, NativeAdapter, Define} from '../src'
class Logger {
}
Define.Class(Logger)

const containerCreator = new ContainerCreator()
const di = containerCreator.create(new NativeAdapter({}))
di.get(Logger).then(logger => console.log(logger instanceof Logger)) // true
