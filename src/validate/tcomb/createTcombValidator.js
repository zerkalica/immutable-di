import {struct} from 'tcomb'
import {validate} from 'tcomb-validation'

function formatErrors(errors) {
    return errors.map(error => error.message)
}

function getSubSchema(schema, path) {
    let ptr = schema
    for (let i = 0; i < path.length; i++) {
        ptr = ptr.meta.props[path[i]]
    }
    return ptr
}

export default function createTcombValidator(rawSchema) {
    const schema = struct(rawSchema, 'State')
    return function createValidator(path) {
        const subSchema = getSubSchema(schema, path)
        return function _validate(data, key) {
            const schemaPart = getSubSchema(subSchema, key ? [key] : [])
            return schemaPart
                ? formatErrors(validate(data, schemaPart, path).errors)
                : []
        }
    }
}
