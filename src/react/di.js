import {Factory} from '../define'
import Container from '../container'
import {Component, createElement, PropTypes as p} from 'react'

export default function di(Deps) {
    return function wrapComponent(BaseComponent) {
        const Getter = Factory(Deps, BaseComponent.displayName || 'DiComponent')(params => params)
        class MarkupComponent extends BaseComponent {
            render() {
                return super.render(this.props, this.context)
            }
        }

        return class DiComponent extends Component {
            static contextTypes = {
                container: p.instanceOf(Container).isRequired
            }
            static depsDefaults = MarkupComponent.depsDefaults || {}

            constructor(props, context) {
                super(props, context)
                this.__deps = context && context.container ?
                    context.container.get(Getter) :
                    this.constructor.depsDefaults
            }

            render() {
                return createElement(MarkupComponent, {...this.__deps, ...this.props})
            }
        }
    }
}
