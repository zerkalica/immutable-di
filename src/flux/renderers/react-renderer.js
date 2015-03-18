export default class ReactRenderer {
    constructor(React, target) {
        this._React = React
        this._target = target
    }

    getDefinition(Widget) {
        let Definition = Widget.__definition
        Definition.__factory = Widget.__deps
        Definition.__actions = Widget.__actions

        return Definition
    }

    render(Widget) {
        const React = this._React
        const target = this._target

        return (stateHandlerProvider) => (
            stateHandlerProvider
                .then(({stateHandler, actions}) => React.createElement(Widget, {stateHandler, actions}))
                .then(widget => (
                    target ?
                        new Promise(resolve => React.render(widget, target, resolve))
                        : React.renderToString(widget)
                ))
        )
    }
}
