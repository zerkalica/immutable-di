import Container from '../container'
import React, {createElement, Component, PropTypes as p} from 'react'

export class StatefullComponent extends Component {
    static propTypes = {
        container: p.instanceOf(Container).isRequired
    }

    static childContextTypes = {
        container: p.instanceOf(Container).isRequired
    }

    static stateMap = {}

    constructor(props, context) {
        super(props, context)
        this.state = props
        this.__listener = null
    }

    getChildContext() {
        return {
            container: this.props.container
        }
    }

    componentDidMount() {
        this.__listener = this.props.container.on(
            this.constructor.stateMap,
            state => this.setState(state),
            this.constructor.displayName
        )
    }

    componentWillUnmount() {
        this.props.container.off(this.__listener)
    }
}

export default function statefull(stateMap = {}) {
    return function wrapComponent(BaseComponent) {
        return class ComponentWrapper extends StatefullComponent {
            static stateMap = stateMap

            render() {
                return createElement(BaseComponent, this.state)
            }
        }
    }
}
