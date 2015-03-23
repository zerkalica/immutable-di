import Context from './context'
import wrapActionMethods from './wrap-action-methods'
import {bindAll} from '../utils'
import Container from '../container'

export default class Renderer {
    static __class = ['StateBinder', Container]

    constructor(container) {
        this._container = container
        this._renderer = null
        bindAll(this)
    }

    setAdapter(renderer) {
        this._renderer = renderer
        return this
    }

    _widgetToDefinition(Widget) {
        const name = this._renderer.getName(Widget)

        return this._container.factory(name + '__Element', {
            props: this._container.createStateDefinition(name, Widget)
        }, {props} => this._renderer.getElement(Widget, props))
    }

    render(Widget) {
        return this._container.get(this._widgetToDefinition(Widget))
            .then(el => this._renderer.render(el))
    }
}
