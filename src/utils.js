export function getDebugPath(args) {
    const [debugPath, name] = args || []
    return (debugPath ? (debugPath + '.') : '') + (name ? name : 'unk')
}

export function convertArgsToOptions(args, argsNames) {
    const obj = {}
    for(let i = 0; i < args.length; i++) {
        obj[argsNames[i]] = args[i]
    }
    return obj
}

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
const FN_MAGIC = 'function'

export function getFunctionName(func) {
    const fnStr = func.toString().replace(STRIP_COMMENTS, '')
    return fnStr.slice(fnStr.indexOf(FN_MAGIC) + FN_MAGIC.length + 1, fnStr.indexOf('('))
}
