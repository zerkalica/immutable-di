import {createElement} from 'react'
import StatefullComponent from './statefull-component'

export default function branch(stateMap = {}) {
    return function wrapComponent(BaseComponent) {
        return class ComponentWrapper extends StatefullComponent {
            static stateMap = stateMap

            render() {
                return createElement(BaseComponent, this.state)
            }
        }
    }
}
