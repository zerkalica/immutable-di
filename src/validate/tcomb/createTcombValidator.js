import {struct} from 'tcomb'
import {validate} from 'tcomb-validation'

function makeFlatTcombSchema(schema, flattenSchema, path) {
    const props = schema.meta.props
    if (props) {
        const keys = Object.keys(props)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            makeFlatTcombSchema(props[key], flattenSchema, path.concat(key))
        }
    }
    flattenSchema[path.join('.')] = schema
}

function formatErrors(prefix, errors) {
    return errors.map(error => prefix + ': ' + error.message)
}

export default function createTcombValidator(schema) {
    const flattenSchema = {}
    const rootName = 'state'
    makeFlatTcombSchema(struct(schema, rootName), flattenSchema, [rootName])
    return function createValidator(path) {
        const p = (path.length ? path.join('.') : '')
        const rootKey = rootName + '.' + p
        return function _validate(data, key) {
            const k = rootKey + (key ? '.' + key : '')
            const schemaPart = flattenSchema[k]
            return schemaPart ? formatErrors(k, validate(data, schemaPart).errors) : []
        }
    }
}
