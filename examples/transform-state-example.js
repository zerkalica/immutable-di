//transform-state-example.js
import {Builder, NativeAdapter} from '../src'

class Logger {
    // babel + playground feature enabled
    static __class = ['Logger']
    log(message) {
        console.log('msg: ' + message)
    }
}

function SrvFactory2(logger, message) {
    return logger.log(message)
}
SrvFactory2.__factory = ['SrvFactory2', Logger, ['TestStore', 'a', 'message']]

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

const ImmutableDi = Builder([SrvFactory2])
const di = ImmutableDi(new NativeAdapter({TestStore: states[0]}))
di.transformState([{id: 'TestStore', data: states[1]}])
//output: msg: test-message-1

di.get(SrvFactory2)
//output: nothing

di.transformState([{id: 'TestStore', data: states[2]}])
//output: msg: test-message-2
