import Container from '../container'
import {Factory, Facet} from '../define'
import {createElement, Component, PropTypes as p} from 'react'

export class StatefullComponent extends Component {
    static contextTypes = {
        container: p.instanceOf(Container).isRequired
    }

    static stateMap = {}

    constructor(props, context) {
        super(props, context)
        function pass(state) {
            return state
        }
        const {stateMap, displayName} = this.constructor
        const Getter = Facet(stateMap, displayName)(pass)
        this.__listener = Factory(stateMap, displayName)(::this.setState)
        this.state = {...props, ...context.container.get(Getter)}
    }

    componentWillReceiveProps(props) {
        this.setState(props)
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
        return class StatefullComponentWrapper extends StatefullComponent {
            static propTypes = BaseComponent.propTypes
            static displayName = BaseComponent.displayName + '#statefull'
            static stateMap = stateMap

            render() {
                return createElement(BaseComponent, this.state)
            }
        }
    }
}
