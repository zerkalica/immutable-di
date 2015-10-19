export default class MetaLoader {
    pathToIdsMap = {}
    _idToDef = {}
    _driver
    _middlewares: Array<func>

    constructor(driver, middlewares: ?Array<func>) {
        this._driver = driver
        this._middlewares = middlewares || []
        this.getMeta = ::this.getMeta
    }

    getMeta(definition, debugCtx) {
        const id = this._driver.getId(definition)
        let result = this._idToDef[id]
        if (!result) {
            result = this._driver.getMeta(definition, debugCtx)
            this._idToDef[id] = result
        }
        return result
    }
}
