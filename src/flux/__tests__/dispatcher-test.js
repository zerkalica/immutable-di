import ContainerCreator from '../../container-creator'
import NativeAdapter from '../../state-adapters/native-adapter'
import {describe, it, spy, sinon, getClass} from '../../test-helper'
import {Factory, Class, Promises, WaitFor} from '../../define'

import Dispatcher from '../dispatcher'

describe('flux/dispatcher', () => {
    let dispatcher
    let container
    beforeEach(() => {
        container = (new ContainerCreator()).create()
        dispatcher = new Dispatcher(container)
    })

    it('should', () => {

    })
})
