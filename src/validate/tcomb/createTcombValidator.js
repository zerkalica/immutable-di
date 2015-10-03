import {struct} from 'tcomb'
import {validate} from 'tcomb-validation'

function makeFlatTcombSchema(schema, flattenSchema, path) {
    const props = schema.meta.props
    if (props) {
        const keys = Object.keys(props)
        for (let i = 0; i < props.length; i++) {
            const key = keys[i]
            makeFlatTcombSchema(props[key], flattenSchema, path.concat(key))
        }
    }
    flattenSchema[path.join('.')] = schema
}

export default function createTcombValidator(schema) {
    const flattenSchema = {}
    makeFlatTcombSchema(struct(schema, 'state'), flattenSchema, ['state'])

    return function createValidator(path) {
        const rootKey = path.length ? path.join('.') : 'state'
        return function _validate(data, key) {
            const schemaPart = flattenSchema[rootKey + (key ? '.' + key : '')]
            return schemaPart ? validate(data, schemaPart).errors : []
        }
    }
}
