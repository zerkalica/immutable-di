export default function getReactConnector(React) {
    class ComponentWrapper extends React.Component {
        static childContextTypes = {
             actions: React.PropTypes.object
        }

        constructor({state, dispatcher, getter, component, context}) {
            super(state)
            this.state = state
            this._dispatcher = dispatcher
            this._getter = getter
            this._component = component
            this._context = context
        }

        getChildContext() {
            return this._context
        }

        componentDidMount() {
            this._listener = this._dispatcher.mount(
                this._getter,
                (state) => this.setState(state)
            )
        }

        componentWillUnmount() {
            this._dispatcher.unmount(this._listener)
        }

        render() {
            return <this._component {...this.state} />
        }
    }

    return ComponentWrapper
}
