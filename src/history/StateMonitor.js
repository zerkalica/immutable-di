import AbstractCursor from '../cursors/abstract'
import Dep from '../utils/Dep'

function filterArgs(args) {
    let result = args
    try {
        JSON.stringify(args)
    } catch(e) {
        result = args.map(arg =>
            (typeof arg === 'function' || typeof arg === 'object')
                ? '[circular]'
                : arg
        )
    }

    return result
}

function StateMonitor(cursor: AbstractCursor) {
    const historyCursor = cursor.select(['__history'])
    historyCursor.set([])

    return function stateMonitor({displayName, id}, args) {
        const prevState = cursor.snap()

        return function stop() {
            const diff = cursor.diff(prevState)

            historyCursor.apply(h => h.concat([
                {
                    displayName,
                    id,
                    args: filterArgs(args),
                    diff
                }
            ]))
        }
    }
}

export default Dep({
    deps: [AbstractCursor]
})(StateMonitor)
