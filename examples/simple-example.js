//simple-example.js
import {Builder, NativeAdapter} from '../src'
class Logger {
    // babel + playground feature enabled
    static __class = ['Logger']
}

const ImmutableDi = Builder()
const di = ImmutableDi(new NativeAdapter({}))
di.get(Logger).then(logger => console.log(logger instanceof Logger)) // true
