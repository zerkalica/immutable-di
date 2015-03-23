export default class ReactRenderer {
    constructor(React, target) {
        this._React = React
        this._target = target
    }

    getElement(Widget, options) {
        return this._React.createElement(Widget, options)
    }

    getName(Widget) {
        return Widget.displayName
    }

    render(el) {
        return new Promise(resolve => (
            this._target ?
                this._React.render(el, this._target, resolve) :
                resolve(this._React.renderToString(el))
        ))
    }
}
