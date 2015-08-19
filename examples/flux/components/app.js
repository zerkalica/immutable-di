import React, {PropTypes as p, Component} from 'react'

import root from 'immutable-di/react/root'
import statefull from 'immutable-di/react/statefull'
import TodoList from './todo-list'

@root
@statefull({
    pageId: ['page', 'id']
})
export default class App extends React.Component {
    render() {
        const {pageId} = this.props
        return (
            <div className="app">
                pageId: {pageId}
                <TodoList/>
            </div>
        )
    }
}
