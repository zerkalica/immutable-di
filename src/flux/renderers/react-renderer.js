export default class ReactRenderer {
    constructor(React, target) {
        this._React = React
        this._target = target
    }

    getActions(Widget) {
        return Widget.actions
    }

    getDefinition(Widget) {
        const len = Widget.definition.length - 1
        let Definition = Widget.definition[len]
        Definition.__factory = [Widget.displayName || 'Definition', Widget.definition.slice(0, len)]
        return Definition
    }

    render(Widget, options) {
        const el = this._React.createElement(Widget, options)

        return new Promise(resolve => (
            this._target ?
                this._React.render(el, this._target, resolve) :
                resolve(this._React.renderToString(el))
        ))
    }
}
