import {createElement, Component, PropTypes as p} from 'react'
import {Factory, Facet} from '../define'
import {IDeps} from '../asserts'
import Container from '../container'
import getFunctionName from '../utils/getFunctionName'

class StatefullComponent extends Component {
    static contextTypes = {
        container: p.instanceOf(Container).isRequired
    }

    static stateMap = {}

    constructor(props, context) {
        super(props, context)
        function pass(state) {
            return state
        }
        this.__setState = ::this.__setState
        const {stateMap, displayName} = this.constructor
        const Getter = Facet(stateMap, displayName)(pass)
        this.__listener = Factory(stateMap, displayName)(this.__setState)
        this.state = {...props, ...context.container.get(Getter)}
        this.__isMounted = false
    }

    __setState(state) {
        if (!this.__isMounted) {
            throw new Error('setState invoked, but component is not mounted: ' + this.constructor.displayName)
        }

        return this.setState(state)
    }

    componentWillReceiveProps(props) {
        this.__setState(props)
    }

    componentDidMount() {
        this.__isMounted = true
        this.context.container.mount(this.__listener)
    }

    componentWillUnmount() {
        this.__isMounted = false
        this.context.container.unmount(this.__listener)
    }
}

export default function statefull(stateMap = {}) {
    IDeps(stateMap)
    return function wrapComponent(BaseComponent) {
        const dn = BaseComponent.displayName || getFunctionName(BaseComponent)

        return class StatefullComponentWrapper extends StatefullComponent {
            static displayName = dn + '_statefull'
            static stateMap = stateMap

            render() {
                return createElement(BaseComponent, this.state)
            }
        }
    }
}
