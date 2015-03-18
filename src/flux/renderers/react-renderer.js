export default class ReactRenderer {
    constructor(React, target) {
        this._React = React
        this._target = target
    }

    getDefinition(Widget) {
        let Definition = Widget.__definition
        Definition.__factory = Widget.__deps

        return Definition
    }

    render(Widget) {
        const React = this._React
        const target = this._target

        return (stateHandlerProvider) => (
            stateHandlerProvider
                .then(stateHandler => React.createElement(Widget, {stateHandler}))
                .then(widget => (
                    target ?
                        new Promise(resolve => React.render(widget, target, resolve))
                        : React.renderToString(widget)
                ))
        )
    }
}
