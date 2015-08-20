import Dep from '../utils/Dep'
import StateMonitor from './StateMonitor'
import getFunctionName from '../utils/getFunctionName'

export default function MonitorFactory(origDep) {
    return function monitorFactory(fn) {
        const dep = origDep(fn)
        const def = dep.__di
        const {isAction, displayName, isCachedTemporary} = def

        function monitorResult(depResult: any, stateMonitor: StateMonitor) {
            let result
            if (isAction && typeof depResult === 'function') {
                result = function depWrap(...args) {
                    const resultData = depResult(...args)
                    const stop = stateMonitor(def, args)

                    Promise.resolve(resultData)
                        .then(stop)
                        .catch(stop)

                    return resultData
                }
                result.displayName = (depResult.displayName || getFunctionName(depResult) || displayName) + '_monitorResult'
            } else {
                result = depResult
            }

            return result
        }

        return Dep({
            deps: [dep, StateMonitor],
            displayName: displayName + '_monitor',
            isCachedTemporary
        })(monitorResult)
    }
}
