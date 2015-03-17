import {Builder, NativeAdapter} from '../..'
import Store  from './store'
import Listener  from './listener'

import Page from './page'

const state = new NativeAdapter({
    status: 'initial'
})

React.createElement(Page)
React.render(Page({}), document.body);

function Listener() {

}

const builder = Builder([Listener], [Store])

const di = builder(state)
di.reset()
