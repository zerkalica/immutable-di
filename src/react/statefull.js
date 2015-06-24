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
        const Getter = Factory(this.constructor.stateMap, this.constructor.displayName || 'StatefullComponent')(state => {
            if (this.__listener) {
                this.setState(state)
            }
            return state
        })

        this.state = {...props, ...context.container.get(Getter)}

        this.__listener = Getter
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
