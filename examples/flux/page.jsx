import React from 'react'
const p = React.PropTypes

function initWidget(Widget, widgetState) {
    return React.createElement(Widget, {state: new State(widgetState)})
}
initWidget.__factory = ['initWidget', Getter]

class State {
    constructor(initialState, dispatcher, getter) {
        this._dispatcher = dispatcher
        this.initialState = initialState
        this._getter = getter
    }
    mount(updateState) {
        this._dispatcher.mount(this._getter)
    }
    unmount() {
        this._dispatcher.unmount(this._getter)
    }
}

export default class Page extends React.Component {
    getInitialState() {
        return this.props.state.initialState
    }

    componentDidMount() {
        this.props.state.mount(state => this.setState(state))
    }

    componentWillUnmount() {
        this.props.state.unmount()
    }

    render() {
        const actions = this.props.actions
        return (
            <div class="page">
                <h1 class="page__header">Test page</h1>
                <div class="page__status">
                    Status: {this.state.status}
                </div>
                <button class="page__button" onClick={actions.click}>Click me</button>
            </div>
        )
    }
}
