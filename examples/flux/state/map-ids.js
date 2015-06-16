import {Factory} from 'immutable-di/define'

function mapIds({todos}) {
    return todos.map(todo => todo.id + '-mapped')
}

export default Factory({
    todos: ['todoApp', 'todos']
})(mapIds)
