import {struct} from 'tcomb'
import getFunctionName from '../../utils/getFunctionName'

export default function typecheck(schema) {
    return function wrapClass(Class: func) {
        Class.$schema = struct(schema, getFunctionName(Class))
        return Class
    }
}
