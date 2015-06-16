import {Factory} from '../define'
import Container from '../container'
import React, {createElement, Component, PropTypes as p} from 'react'

export class DiComponent extends Component {
    static contextTypes = {
        container: p.instanceOf(Container).isRequired
    }
}

export default function di(deps) {
    return function wrapComponent(BaseComponent) {
        const Getter = Factory(deps, BaseComponent.displayName)(p => p)
        return class ComponentWrapper extends DiComponent {
            render() {
                const di = this.context.container.get(Getter)
                return createElement(BaseComponent, {...this.props, ...di})
            }
        }
    }
}
