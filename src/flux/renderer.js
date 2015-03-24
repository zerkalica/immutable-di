import {bindAll} from '../utils'
import Container from '../container'

export default class Renderer {
    static __class = ['StateBinder', Container]

    constructor(container) {
        this._container = container
        this._renderer = null
        bindAll(this)
    }

    setAdapter(renderer) {
        this._renderer = renderer
        return this
    }

    _createDefinition(Widget) {
        const {displayName, props, state} = Widget
        const name = displayName
        const stateDef = factory(name + '.state', state)

        return factory(
            name + '.element',
            factory(name, {
                updater: factory(
                    name + '.updaterProvider',
                    {},
                    () => ((setState) => factory(name + '.updater', stateDef, state => setState(state)))
                ),
                props: factory(name + '.props', props),
                state: stateDef
            })
        )
    }

    render(Widget) {
        return this._container.get(this._createDefinition(Widget))
            .then(props => this._renderer.render(this._renderer.getElement(Widget, props)))
    }
}
