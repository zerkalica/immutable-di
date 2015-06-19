import Container from '../container'
import {createElement, Component, PropTypes as p} from 'react'

export class StatefullComponent extends Component {
    static contextTypes = {
        container: p.instanceOf(Container).isRequired
    }

    static stateMap = {}

    constructor(props, context) {
        super(props, context)
        this.state = props
        this.__listener = null
    }

    componentDidMount() {
        this.__listener = this.context.container.on(
            this.constructor.stateMap,
            state => this.setState(state),
            this.constructor.displayName
        )
    }

    componentWillUnmount() {
        this.context.container.off(this.__listener)
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
