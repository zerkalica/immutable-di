import Context from './context'
import wrapActionMethods from './wrap-action-methods'
import {bindAll} from '../utils'

export default class StateBinder {
    constructor({container, dispatcher}) {
        this._container = container
        this._dispatcher = dispatcher
        bindAll(this)
    }

    setRenderer(renderer) {
        this._renderer = renderer
        return this
    }

    _widgetToDefinition(Widget) {
        const renderer = this._renderer
        function WidgetProvider(options) {
            return renderer.getElement(Widget, options)
        }
        WidgetProvider.__factory = Widget.__props

        return WidgetProvider
    }

    render(Widget) {
        return this._container.get(this._widgetToDefinition(Widget))
            .then(el => this._renderer.render(el))
    }
}
