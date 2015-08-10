import Container from '../container'
import NativeCursor from '../cursors/native'
import {Component, createElement, PropTypes as p} from 'react'

export class RootComponent extends Component {
    static propTypes = {
        container: p.instanceOf(Container),
        state: p.object
    }

    static childContextTypes = {
        container: p.instanceOf(Container).isRequired
    }

    constructor(props, context) {
        super(props, context)
        this.__container = props.container || new Container(new NativeCursor(props.state))
    }

    getChildContext() {
        return {
            container: this.__container
        }
    }
}

export default function root(BaseComponent) {
    return class RootComponentWrapper extends RootComponent {
        static stateMap = BaseComponent.stateMap
        static propTypes = BaseComponent.propTypes
        static displayName = BaseComponent.displayName + '#root'

        render() {
            return createElement(BaseComponent, this.props)
        }
    }
}
