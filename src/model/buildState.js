type IPath = Array<string>

type IStateSpec<TSchema> = {
    [modelName: string]: {
        $id: string,
        $schema: TSchema,
        $default: object
    }
}

type IError = string
type IValidator = (path: IPath) => Array<IError>

type IValidatorCreate<TSchema> = (schemas: {[key: string]: TSchema}) => IValidator

type IState = {
    state: object,
    pathMap: {[name: string]: string},
    validate: IValidator
}

export default function buildState(
    stateSpec: IStateSpec<TSchema>,
    createValidator: IValidatorCreate<TSchema>
): IState {
    const state = {}
    const pathMap = {}
    const schemas = {}

    const keys = Object.keys(stateSpec)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const {$schema, $default, $} = stateSpec[key]
        state[key] = $default
        schemas[key] = $schema
        const id = $.$.$path[0]
        pathMap[id] = key
    }

    return {
        state,
        pathMap,
        validate: createValidator(schemas)
    }
}
