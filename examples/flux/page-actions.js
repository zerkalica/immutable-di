import {WrapActionMethods, Dispatcher} from '../../src'

export default class PageActions {
    static __class = ['PageActions', Dispatcher]
    constructor(dispatcher) {
        this._dispatcher = dispatcher
    }

    addTodo(todo) {
        return todo
    }
}
WrapActionMethods(PageActions)
