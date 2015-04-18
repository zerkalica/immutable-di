function methodToConst(methodName) {
    return methodName
}

function constToMethod(methodName) {
    return methodName
}

export default function wrapActionMethods(o) {
    if (o.__wrapped) {
        return
    }
    o.__wrapped = true

    const obj = o.prototype
    const keys = Object.keys(obj)

    for (let i = 0, l = keys.length; i < l; ++i) {
        const methodName = keys[i]
        const fn = obj[methodName]
        obj[methodName] = (key) => (function (a1, a2, a3, a4, a5) {
            const result = fn(a1, a2, a3, a4, a5)
            if(result !== undefined) {
                this.__dispatcher.dispatch(key, result)
            }
        })(methodToConst(methodName))
    }
}
