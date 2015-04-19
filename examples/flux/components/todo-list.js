import React from 'react'
import debug from 'debug'
const info = debug('immutable-di:flux:TodoList')

export default class TodoList extends React.Component {
    render() {
        info('state: %o', this.props)
        return (
            <div>
                <h1>Hello</h1>
            </div>
        )
    }
}
