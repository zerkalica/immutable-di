import BaseAnnotations from '../model/BaseAnnotations'

export default class AbstractDefinitionDriver {
    _annotations: BaseAnnotations

    constructor() {
        this.add = ::this.add
        this.getId = ::this.getId
        this.getMeta = ::this.getMeta
    }

    setAnnotations(annotations: BaseAnnotations) {
        this._annotations = annotations
    }

    add(fn, definition) {
        throw new Error('implement')
    }

    getId(fn, debugCtx) {
        throw new Error('implement')
    }

    getMeta(fn, debugCtx) {
        throw new Error('implement')
    }
}
