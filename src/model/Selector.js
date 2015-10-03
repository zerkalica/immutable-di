export type IPath = Array<string>
export type IStateSpec<TSchema> = {
    [modelName: string]: {
        $schema: TSchema,
        $: object,
        $default: object
    }
}
export type IError = string
export type IValidator = (path: IPath) => Array<IError>
export type IValidatorCreate<TSchema> = (schemas: {[key: string]: TSchema}) => IValidator

type IState = {
    state: object,
    pathMap: {[name: string]: string},
    validate: ?IValidator
}

function updateCursor(cursor, path) {
    const keys = Object.keys(cursor)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (key === '$') {
            cursor[key].$path = path
        } else {
            updateCursor(cursor[key], path.concat(key))
        }
    }
}

export default function buildState(
    stateSpec: IStateSpec<TSchema>,
    createValidator: IValidatorCreate<TSchema>
): IState {
    const state = {}
    const pathMap = {}
    const schemas = {}
    let hasSchema = false

    const keys = Object.keys(stateSpec)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const {_schema, defaults, $} = stateSpec[key]
        state[key] = defaults
        if (_schema) {
            hasSchema = true
            schemas[key] = _schema
        }
        updateCursor($, [key])
        const id = $.$.$path[0]
        pathMap[id] = key
    }

    return {
        state,
        pathMap,
        validate: hasSchema ? createValidator(schemas) : undefined
    }
}

export default function Selector({
    stateSpec,
    createValidator,
    Cursor,
    notify
}): (pth: IPath) => AbstractCursor {
    const {state, pathMap, validate} = buildState(stateSpec, createValidator)

    return function selector(pth: IPath): AbstractCursor {
        const path = pth || []
        const mappedId = pathMap[path[0]]
        const prefix = mappedId
            ? [mappedId].concat(path.slice(1))
            : path

        return new Cursor({
            state,
            prefix,
            validate: validate ? validate(prefix) : undefined,
            notify
        })
    }
}
