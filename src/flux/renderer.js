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

    _widgetToDefinition(name, Widget) {
        const factory = this._container.factory
        return factory(
            name + '__Element',
            factory(name, {
                props: factory(name + '__Props', Widget.__props),
                state: factory(name + '__State', Widget.__state, Widget.__transducer)
            }),
            {props} => this._renderer.getElement(Widget, props)
        )
    }

    render(Widget) {
        return this._container.get(this._widgetToDefinition(this._renderer.getName(Widget), Widget))
            .then(el => this._renderer.render(el))
    }
}
