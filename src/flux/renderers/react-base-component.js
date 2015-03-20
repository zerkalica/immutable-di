export class BaseComponent {
    constructor(base, options) {
        this.markup = base.markup
        this._context = options.context
        this._actions = options.actions
    }

    componentDidMount() {
        this._context && this._context.mount(this.state ? state => this.setState(state) : void 0)
    }

    componentWillUnmount() {
        this._context && this._context.unmount()
    }

    render() {
        return this.markup(this.props, this._actions, this.state)
    }
}
