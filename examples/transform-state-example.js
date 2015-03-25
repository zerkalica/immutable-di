//transform-state-example.js
import {ContainerCreator, Dispatcher, NativeAdapter, Define} from '../src'

class Logger {
    log(message) {
        console.log('msg: ' + message)
    }
}
Define.Class(Logger)

function SrvFactory2(logger, message) {
    return logger.log(message)
}
Define.Factory(SrvFactory2, Logger, 'TestStore.a.message')

const states = [
    {},
    {
        a: {
            message: 'test-message-1'
        }
    },
    {
        a: {
            message: 'test-message-2'
        }
    }
]

const containerCreator = new ContainerCreator()
const di = containerCreator.create(new NativeAdapter({TestStore: states[0]}))

di.get(Dispatcher)
    .then(dispatcher => dispatcher.setStores([SrvFactory2])
    .then(function () {
        di.transformState([{id: 'TestStore', data: states[1]}])
        //output: msg: test-message-1

        di.get(SrvFactory2)
        //output: nothing

        di.transformState([{id: 'TestStore', data: states[2]}])
        //output: msg: test-message-2
    })
