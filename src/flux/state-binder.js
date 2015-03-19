import Context from './context'
import wrapActionMethods from './wrap-action-methods'

export default class StateBinder {
    constructor({renderer, container, dispatcher}) {
        this._renderer = renderer
        this._container = container
        this._dispatcher = dispatcher
    }
    render(Widget) {
        const actions = this._renderer.getActions(Widget)
        const definition = this._renderer.getDefinition(Widget)
        wrapActionMethods(actions)

        return Promise.all([
            actions ? this._container.get(actions) : null,
            this._container.get(definition)
        ]).then(function([actions, props]) {
            actions.__dispatcher = this._dispatcher

            return this._renderer.render(Widget, {
                actions,
                props,
                context: new Context({
                    definition,
                    actions,
                    dispatcher: this._dispatcher,
                    onUpdate: options => this._renderer.render(Widget, options)
                })
            })
        }.bind(this))
    }
}
