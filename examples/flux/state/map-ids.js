import {Facet} from 'immutable-di/define'

function mapIds({todos}) {
    return todos.map(todo => todo.id + '-mapped')
}

export default Facet({
    todos: ['todoApp', 'todos']
})(mapIds)
