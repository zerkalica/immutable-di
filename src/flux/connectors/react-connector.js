import Dispatcher from '../dispatcher'
export default function getReactConnector(React, childContextTypes) {
    const p = React.PropTypes
    class ComponentWrapper extends React.Component {
        static childContextTypes = {
            actions: p.object.isRequired
        }

        static propTypes = {
            dispatcher: p.instanceOf(Dispatcher).isRequired,
            state: p.object.isRequired,
            getter: p.func.isRequired,
            component: p.func.isRequired,
            actions: p.object.isRequired
        }

        __listener = null

        constructor(props, context) {
            super(props, context)
            this.state = props.state
        }

        getChildContext() {
            return {
                actions: this.props.actions
            }
        }

        componentDidMount() {
            this.__listener = this.props.dispatcher.mount(
                this.props.getter,
                state => this.setState(state)
            )
        }

        componentWillUnmount() {
            this.props.dispatcher.unmount(this.__listener)
        }

        render() {
            return <this.props.component {...this.props.state} />
        }
    }

    return ComponentWrapper
}
