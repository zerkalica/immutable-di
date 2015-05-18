import 'babel-core/polyfill'
import 'isomorphic-fetch'
import debug from 'debug'

if (process.env.IS_BROWSER && process.env.DEBUG) {
    debug.enable(process.env.DEBUG)
}
