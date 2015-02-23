//state-example.js
import {Builder, NativeAdapter} from '../src'

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
    // [WARN] .debug. test-string (test-query)
}

middleware({
    query: 'test-query'
})
