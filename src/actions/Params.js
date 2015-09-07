import {Factory} from 'immutable-di/define'
import {schemaValidate} from 'tcomb-validator-plus/helpers'

export default function Params(path, schema) {
    const dep = Factory([path])(schemaValidate(schema))
    dep.__di.isQuery = true
    return dep
}
