import ContainerCreator from '../container-creator'
import Container from '../container'
import {describe, it, spy, sinon, getClass} from '../test-helper'

describe('container-creator', () => {
    it('should create new container', () => {
        const creator = new ContainerCreator()
        creator.create().should.instanceOf(Container)
    })
})
