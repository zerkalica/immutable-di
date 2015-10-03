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
        const {_schema, defaults, cursor} = stateSpec[key]
        state[key] = defaults
        if (_schema) {
            hasSchema = true
            schemas[key] = _schema
        }
        updateCursor(cursor, [key])
        const id = cursor.$.$path[0]
        pathMap[id] = key
    }

    return {
        state,
        pathMap,
        validate: hasSchema ? createValidator(schemas) : undefined
    }
}

export default class Selector {
    _state: object
    _pathMap: {[name: string]: string}
    validate: ?IValidator

    constructor({
        stateSpec,
        createValidator,
        cursor,
        notify
    }): {
        stateSpec: IStateSpec<TSchema>,
        createValidator: IValidatorCreate<TSchema>,
        cursor: AbstractCursor,
        notify: func
    } {
        const {state, pathMap, validate} = buildState(stateSpec, createValidator)
        this._state = state
        this._pathMap = pathMap
        this._validate = validate
        this._cursor = cursor
        this._notify = notify

        this.select = ::this.select
    }

    select(path: PathType = []): AbstractCursor<State> {
        const mappedId = this._pathMap[path[0]]
        const prefix = mappedId
            ? [mappedId].concat(path.slice(1))
            : path

        return new this._cursor({
            state: this._state,
            prefix,
            validate: this._validate ? this._validate(prefix) : undefined,
            notify: this._notify
        })
    }
}
