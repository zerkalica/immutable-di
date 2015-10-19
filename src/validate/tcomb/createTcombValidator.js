import {struct, Obj} from 'tcomb'
import {validate} from 'tcomb-validation'

function formatErrors(errors) {
    return errors.map(error => error.message)
}

export default function createTcombValidator(schemas) {
    const rawSchema = {}
    Object.keys(schemas).forEach(key => {
        rawSchema[key] = schemas[key] || Obj
    })
    const schema = struct(rawSchema, 'State')
    return function _validate(data) {
        return formatErrors(validate(data, schema).errors)
    }
}
