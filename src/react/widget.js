import {Component} from 'react'

export default function Widget(renderMethod) {
    return class WidgetWrapper extends Component {
        render() {
            return renderMethod.call(this, this.props, this.context)
        }
    }
}
