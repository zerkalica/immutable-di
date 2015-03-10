function methodToConst(methodName) {
  return methodName
}

function constToMethod(methodName) {
  return methodName
}

export default function wrapActionMethods(Actions) {
  if (Actions.__wrapped__) {
    return
  }

  const obj = Actions.prototype
  const keys = Object.keys(obj)

  for (let i = 0, l = keys.length; i < l; ++i) {
    const methodName = keys[i]
    const fn = obj[methodName]
    const key = methodToConst(methodName)
    obj[methodName] = (key) => (function (a1, a2 , a3, a4, a5) {
      const result = fn(a1, a2, a3, a4, a5)
      if (result !== void 0) {
        this.dispatch(key, result)
      }
    })(key)
  }
  Actions.__wrapped__ = true
}
