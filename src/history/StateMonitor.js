import AbstractCursor from '../cursors/abstract'
import BaseDiff from './BaseDiff'
import Dep from '../utils/Dep'

function StateMonitor(cursor: AbstractCursor, differ: BaseDiff) {
    const toJS = cursor.toJS
    const historyCursor = cursor.select(['__history'])
    historyCursor.set([])

    return function stateMonitor({displayName, id}, args) {
        const prevState = toJS()
        return function stop() {
            const nextState = toJS()
            const diff = differ.diff(prevState, nextState)

            historyCursor.apply(history =>
                history.push({
                    displayName,
                    id,
                    args,
                    diff
                })
            )
        }
    }
}

export default Dep({
    deps: [AbstractCursor, BaseDiff]
})(StateMonitor)
