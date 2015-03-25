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

    render(Widget) {
        return this._container.get(Widget.__diGetter)
            .then(options => this._renderer.render(this._renderer.getElement(Widget, options)))
    }
}
