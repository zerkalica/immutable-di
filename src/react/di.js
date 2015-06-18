import {Factory} from '../define'
import Container from '../container'
import React, {createElement, Component, PropTypes as p} from 'react'

export class DiComponent extends Component {
    static contextTypes = {
        container: p.instanceOf(Container).isRequired
    }
}

export default function di(Deps) {
    return function wrapComponent(BaseComponent) {
        const Getter = Factory(Deps, BaseComponent.displayName)(params => params)
        return class ComponentWrapper extends DiComponent {
            render() {
                const deps = (this.context && this.context.container) ?
                    this.context.container.get(Getter)
                    : {}

                return createElement(BaseComponent, {...this.props, ...deps})
            }
        }
    }
}
