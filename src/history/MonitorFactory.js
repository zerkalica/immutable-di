import Dep from '../utils/Dep'
import StateMonitor from './StateMonitor'

export default function MonitorFactory(origDep) {
    return function monitorFactory(fn) {
        const dep = origDep(fn)
        const def = dep.__di
        const {isAction, displayName} = def

        function monitorResult(depResult: any, stateMonitor: StateMonitor) {
            let result
            if (typeof depResult === 'function' && isAction) {
                result = function depWrap(...args) {
                    const resultData = dep(...args)
                    const stop = stateMonitor(def, args)

                    Promise.resolve(resultData)
                        .then(stop)
                        .catch(stop)

                    return result
                }
            } else {
                result = depResult
            }

            return result
        }

        return Dep({
            deps: [dep, StateMonitor],
            displayName: 'action#' + displayName,
            pathMapper: Path
        })(monitorResult)
    }
}
