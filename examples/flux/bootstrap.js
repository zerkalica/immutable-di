import __debug from 'debug'

if (process.env.IS_BROWSER && process.env.DEBUG) {
    __debug.enable(process.env.DEBUG)
}
