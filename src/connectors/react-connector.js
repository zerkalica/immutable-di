import Dispatcher from '../dispatcher'
import React, {PropTypes as p} from 'react'

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
        this.props.get = props.dispatcher.get
        this.state = props.state
        this.__listener = null
    }

    getChildContext() {
        const keys = Object.keys(this.constructor.childContextTypes)
        const result = {}
        for (let i = 0; i < keys.length; i++) {
            const name = keys[i]
            result[name] = this.props[name]
        }

        return result
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

export default function getReactConnector(React, childContextTypes) {
    const p = React.PropTypes
    
    return ComponentWrapper
}

