import Dispatcher from '../dispatcher'
import {getDef} from '../../define'

export default function getReactConnector(React, childContextTypes) {
    const p = React.PropTypes
    class ComponentWrapper extends React.Component {
        static childContextTypes = {
            actions: p.object.isRequired,
            get: p.func.isRequired
        }

        static propTypes = {
            dispatcher: p.instanceOf(Dispatcher).isRequired,
            state: p.object.isRequired,
            component: p.func.isRequired,
            actions: p.object.isRequired
        }

        constructor(props, context) {
            super(props, context)
            this.state = props.state
            this.__listener = null
        }

        getChildContext() {
            return {
                actions: this.props.actions,
                get: this.props.dispatcher.get
            }
        }

        componentDidMount() {
            this.__listener = this.props.dispatcher.mount(
                this.props.component,
                state => this.setState(state)
            )
        }

        componentWillUnmount() {
            this.props.dispatcher.unmount(this.__listener)
        }

        render() {
            return <this.props.component {...this.state} />
        }
    }

    return ComponentWrapper
}
