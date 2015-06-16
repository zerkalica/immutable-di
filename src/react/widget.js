import React, {Component} from 'react'

export default function Widget(renderMethod) {
    return class ComponentWrapper extends Component {
        render() {
            return renderMethod.call(this, this.props, this.context)
        }
    }
}
