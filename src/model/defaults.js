import getFunctionName from '../utils/getFunctionName'
import createCursors from './createCursors'

export default function defaults(defs: object) {
    return function wrapClass(Class: func) {
        Class.$ = createCursors(defs, [getFunctionName(Class)])
        Class.$default = defs
        return Class
    }
}
