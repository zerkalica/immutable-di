export default class PromiseSeries {
    constructor() {
        this.promise = null
        this._count = 1
        this._resetPromise()
    }

    add(cb) {
        this._count++
        this.promise = this.promise
            .then(cb)
            .then(data => {
                this._resetPromise()
                return data
            })
            .catch(err => {
                this._resetPromise()
                throw err
            })

        return this.promise
    }

    _resetPromise() {
        this._count--;
        if (this._count === 0) {
            this.promise = new Promise(resolve => resolve())
        }
    }
}
