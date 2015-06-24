import Container from '../container'
import {Factory} from '../define'
import {createElement, Component, PropTypes as p} from 'react'

export class StatefullComponent extends Component {
    static contextTypes = {
        container: p.instanceOf(Container).isRequired
    }

    static stateMap = {}

    constructor(props, context) {
        super(props, context)
        this.state = props
        this.__listener = Factory(this.constructor.stateMap, this.constructor.displayName || 'StatefullComponent')(::this.setState)
    }

    componentWillReceiveProps(props) {
        this.setState({...this.state, ...props})
    }

    componentDidMount() {
        this.context.container.mount(this.__listener)
    }

    componentWillUnmount() {
        this.context.container.unmount(this.__listener)
    }
}

export default function statefull(stateMap = {}) {
    return function wrapComponent(BaseComponent) {
        class MarkupComponent extends BaseComponent {
            render() {
                return super.render(this.props, this.context)
            }
        }

        return class StatefullComponentWrapper extends StatefullComponent {
            static stateMap = stateMap
            render() {
                return createElement(MarkupComponent, this.state)
            }
        }
    }
}
