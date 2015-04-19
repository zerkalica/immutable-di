import __polyfill from 'babel-core/polyfill'
import __fetch from 'isomorphic-fetch'
import debug from 'debug'

if (process.env.IS_BROWSER && process.env.DEBUG) {
    debug.enable(process.env.DEBUG)
}
