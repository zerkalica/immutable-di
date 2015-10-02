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
    makeFlatTcombSchema(struct(schema, 'IAppState'), flattenSchema, [])

    return function createValidator(path) {
        const key = path.length ? path.join('.') : 'IAppState'
        const schemaPart = flattenSchema[key]
        return function _validate(data) {
            return schemaPart ? validate(schemaPart, data) : null
        }
    }
}
