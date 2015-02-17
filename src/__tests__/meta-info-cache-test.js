import GenericAdapter from '../definition-adapters/generic-adapter'
import {testFuncMeta, testFunc} from '../__mocks__/fixture-definition'
import MetaInfoCache from '../meta-info-cache'

describe('meta-info-cache', () => {
    let meta
    before(() => {
        meta = new MetaInfoCache(GenericAdapter)
    })
    it('should throw error if not a valid definition in argument', () => {
        function testF() {}
        (() => meta.get(testF)).should.throw('Property .__factory or .__class not exist in unk')
    })
    it('should include definition keys', () => {
        let definition = meta.get(testFunc)
        definition.should.to.include.keys(['id', 'handler', 'name', 'waitFor', 'deps', 'statePaths', 'debugPath'])
    })
    it('should have a valid debugPath', () => {
        let definition = meta.get(testFunc)
        definition.debugPath.should.be.equal('testFunc')
    })
    it('should have a valid statePaths', () => {
        let definition = meta.get(testFunc)
        definition.statePaths.should.be.deep.equal([[ 'state', 'a', 'b1' ], [ 'state', 'a', 'b' ]])
    })
    it('should have a valid definition', () => {
        let definition = meta.get(testFunc);
        delete definition.statePaths;
        delete definition.debugPath;
        definition.should.be.deep.equal(testFuncMeta)
    })
})
