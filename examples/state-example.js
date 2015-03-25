//state-example.js
import {ContainerCreator, NativeAdapter, Define} from '../src'

const config = {
    logger: {
        level: 'debug'
    }
};

function ConsoleOut() {
    return (message) => console.log(message)
}
Define.Factory(ConsoleOut)

class Logger {
    constructor(query, config, out) {
        this.query = query
        this.level = config.level
        this.out = out
    }

    warn(message) {
        this.out('[WARN] .' + this.level + '. ' + message + ' (' + this.query + ')')
    }
}
Define.Class(Logger, ['req.query', 'config.logger', ConsoleOut])

// Need for static caching meta-info from di-classes between middleware calls
const containerCreator = new ContainerCreator()

// emulate server call
function middleware(req) {
    const state = {
        req: req,
        config: config
    }

    const di = containerCreator.create(new NativeAdapter(state))

    di.get(Logger)
        .then(logger => logger.warn('test-string'))
        .catch(err => console.log(err.stack))
}

middleware({
    query: 'test-query'
})
// [WARN] .debug. test-string (test-query)
