import {Factory} from 'immutable-di/define'
import tr from 'transduce'

function mapIds1({todos, faset}) {
    return tr.compose()todos.map(todo => todo.id + '-mapped')
}

export default Factory({
    todos: ['todoApp', 'todos'],
    faset
})(mapIds1)
