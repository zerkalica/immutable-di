import Container from '../container'
import Dispatcher from '../dispatcher'
import React, {Component, PropTypes as p} from 'react'

export default class StatefullComponent extends Component {
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
        this.__listener = this.props.container.get(Dispatcher).mount(
            this.constructor.stateMap,
            state => this.setState(state)
        )
    }

    componentWillUnmount() {
        this.props.container.get(Dispatcher).unmount(this.__listener)
    }
}
