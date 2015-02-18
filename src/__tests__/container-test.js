import Container from '../container'
import MetaInfoCache from '../meta-info-cache'
import NativeAdapter from '../state-adapters/native-adapter'
import GenericAdapter from '../definition-adapters/generic-adapter'
import {testFunc} from '../__mocks__/fixture-definition'

describe('container', () => {
    let state = {}
    let container = new Container({
        state: new NativeAdapter(state),
        metaInfoCache: new MetaInfoCache(GenericAdapter),
        globalCache: new Map()
    })

    it('should resolve deps for testFunc', () => {
        return container.get(testFunc).should.eventually.to.equal('testFunc.value.DepClass.value.depFn.value')
    })

    it('should resolve deps for testFunc', () => {
        function testFunc() {

        }
        testFunc.__factory=['testFunc', [dep1, dep2, 'ar.qe']]

        return container.get(testFunc).should.eventually.to.equal('testFunc.value.DepClass.value.depFn.value')
    })
})
