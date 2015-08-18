import {Component, createElement, PropTypes as p} from 'react'
import Container from '../container'
import getFunctionName from '../utils/getFunctionName'
import NativeCursor from '../cursors/native'

export class RootComponent extends Component {
    static propTypes = {
        container: p.instanceOf(Container),
        state: p.object
    }

    static childContextTypes = {
        container: p.instanceOf(Container).isRequired
    }

    getChildContext() {
        return {
            container: this.props.container || new Container(new NativeCursor(this.props.state))
        }
    }
}

export default function root(BaseComponent) {
    const dn = BaseComponent.displayName || getFunctionName(BaseComponent)
    return class RootComponentWrapper extends RootComponent {
        static displayName = dn + '#root'

        render() {
            return createElement(BaseComponent, this.props)
        }
    }
}
