const cancelNames = [
    'cancelAnimationFrame',
    'webkitCancelAnimationFrame',
    'webkitCancelRequestAnimationFrame',
    'mozCancelRequestAnimationFrame',
    'oCancelRequestAnimationFrame',
    'msCancelRequestAnimationFrame'
]

const requestNames = [
    'requestAnimationFrame',
    'webkitRequestAnimationFrame',
    'mozRequestAnimationFrame',
    'oRequestAnimationFrame',
    'msRequestAnimationFrame'
]

function getBrowserFn(names) {
    let result
    if (typeof window !== 'undefined') {
        const filteredNames = names.filter(name => !!window[name])
        result = filteredNames.length ? window[filteredNames[0]] : undefined
    }

    return result
}

function fallbackRequestAnimationFrame(cb) {
    return setTimeout(cb, 0)
}

function fallbackCancelAnimationFrame(handle) {
    return clearTimeout(handle)
}

const _browserCancelAnimationFrame = getBrowserFn(cancelNames)
const browserRequestAnimationFrame = getBrowserFn(requestNames)

function browserCancelAnimationFrame(handle) {
    return handle ? _browserCancelAnimationFrame(handle.value) : null
}

export const cancelAnimationFrame = _browserCancelAnimationFrame
    ? browserCancelAnimationFrame
    : fallbackCancelAnimationFrame

export const requestAnimationFrame = browserRequestAnimationFrame
    ? browserRequestAnimationFrame
    : fallbackRequestAnimationFrame
