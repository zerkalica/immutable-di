
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
const FN_MAGIC = 'function'

export default function getFunctionName(func) {
    if (func.displayName) {
        return func.displayName
    }
    const fnStr = func.toString().replace(STRIP_COMMENTS, '')
    return fnStr.slice(fnStr.indexOf(FN_MAGIC) + FN_MAGIC.length + 1, fnStr.indexOf('('))
}
