import {promiseValidate, ParamsError} from 'tcomb-validator-plus/helpers'
import {ifError} from '../utils/Promised'

export default function createAction({
    displayName,
    request,
    schema,
    setState,
    setServerErrors,
    setParamErrors
}) {
    const validate = promiseValidate(schema)

    function action(payload) {
        return validate(payload)
            .then(request)
            .then(setState)
            .catch(ifError(ParamsError, e => setParamErrors(e.errors)))
            .catch(setServerErrors)
    }
    action.displayName = displayName

    return action
}
