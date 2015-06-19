import Container from '../container'
import {Component, createElement, PropTypes as p} from 'react'

export class RootComponent extends Component {
    static propTypes = {
        container: p.instanceOf(Container).isRequired
    }

    static childContextTypes = {
        container: p.instanceOf(Container).isRequired
    }

    getChildContext() {
        return {
            container: this.props.container
        }
    }
}

export default function root(BaseComponent) {
    return class RootComponentWrapper extends RootComponent {
        static stateMap = BaseComponent.stateMap
        render() {
            return createElement(BaseComponent, this.props)
        }
    }
}
