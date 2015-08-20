import AbstractCursor from '../cursors/abstract'
import Dep from '../utils/Dep'

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
                    args,
                    diff
                }
            ]))
        }
    }
}

export default Dep({
    deps: [AbstractCursor]
})(StateMonitor)
