import React from 'react'
import StatefullComponent from './statefull-component'

export function branch(stateMap = {}) {
    return function wrapComponent(BaseComponent) {
        return class ComponentWrapper extends StatefullComponent {
            static stateMap = stateMap
            render() {
                return <BaseComponent {...this.state} />
            }
        }
    }
}
