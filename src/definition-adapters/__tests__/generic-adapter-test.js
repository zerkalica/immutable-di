import {factory, extractMetaInfo, idFromDefinition} from '../generic-adapter'
import {testFuncMeta, testFunc, testObjectDeps, testObjectDepsMeta} from '../../__mocks__/fixture-definition'

describe('definition-adapters/generic-adapter', () => {
    describe('factory', () => {
        let fn, deps
        beforeEach(() => {
            let dep1 = s => s
            dep1.__factory = ['dep1']
            deps = [dep1]
            fn = factory('test', deps)
        })

        it('should build __factory definition from params', () => {
            fn.should.include.keys('__factory')
        })

        it('should bind name and deps to __factory definition', () => {
            fn.__factory.should.to.be.deep.equal(['test', deps])
        })

        it('should bind function to __factory from arguments', () => {
            let fn = p => p
            const fn2 = factory('test', deps, fn)
            fn2.should.to.be.equal(fn)
        })
    })

    describe('idFromDefinition', () => {
        it('should not accept empty or null', () => {
            let message = 'Getter is not a definition in arg';
            (() => idFromDefinition()).should.to.throw(message);
            (() => idFromDefinition(null)).should.throw(message);
            (() => idFromDefinition(false)).should.throw(message);
            (() => idFromDefinition(0)).should.throw(message);
            (() => idFromDefinition('')).should.throw(message);
            (() => idFromDefinition([])).should.throw(message);
            (() => idFromDefinition({})).should.throw(message);
        })

        it('should accept function', () => {
            function testFunc() {}
            testFunc.__factory = ['testFunc'];
            (() => idFromDefinition(testFunc)).should.not.throw();
        })

        it('should return mappable id from function', () => {
            function testFunc() {}
            testFunc.__factory = ['testFunc'];
            idFromDefinition(testFunc).should.to.equal('testFunc');
        })
    })

    describe('extractMetaInfo', () => {
        it('should not accept empty or null', () => {
            let message = 'Getter is not a definition in arg';
            (() => extractMetaInfo()).should.throw(message);
            (() => extractMetaInfo(null)).should.throw(message);
            (() => extractMetaInfo(false)).should.throw(message);
            (() => extractMetaInfo(0)).should.throw(message);
            (() => extractMetaInfo('')).should.throw(message);
            (() => extractMetaInfo([])).should.throw(message);
            (() => extractMetaInfo({})).should.throw(message);
        })

        it('should throw error, if definition property is empty in argument', () => {
            let message = 'Property .__factory or .__class not exist in function testFunc() {}';
            function testFunc() {}
            (() => extractMetaInfo(testFunc)).should.throw(message);
            testFunc.__factory = null;
            (() => extractMetaInfo(testFunc)).should.throw(message);
            testFunc.__factory = '';
            (() => extractMetaInfo(testFunc)).should.throw(message);
        })

        it('should throw error, if definition property is not an array in argument', () => {
            function testFunc() {}
            testFunc.__factory = {};
            let message = 'Property .__factory or .__class is not an array in function testFunc() {}';
            (() => extractMetaInfo(testFunc)).should.throw(message);
        })

        it.skip('should convert simple factory definition to metainfo', () => {
            function testFunc() {}
            testFunc.__factory = ['testFunc'];
            let meta = {
                id: 'testFunc',
                scope: 'global',
                scopes: [],
                handler: testFunc,
                deps: [],
                waitFor: [],
                name: 'testFunc'
            };
            extractMetaInfo(testFunc).should.to.deep.equal(meta);
        })

        it('should convert simple class definition to metainfo', () => {
            class TestClass {}
            TestClass.__class = ['TestClass'];
            let meta = {
                id: TestClass,
                handler: TestClass,
                deps: [],
                waitFor: [],
                name: 'TestClass'
            };
            const orig = extractMetaInfo(TestClass);

            orig.should.include.keys(['id', 'handler', 'deps', 'waitFor', 'name'])

            orig.handler().should.to.be.instanceOf(TestClass);
        })

        it.skip('should convert factory definition with deps as object to metainfo', () => {
            extractMetaInfo(testObjectDeps).should.to.deep.equal(testObjectDepsMeta);
        })

        it('should convert factory definition with deps as array to metainfo', () => {
            extractMetaInfo(testFunc).should.to.deep.equal(testFuncMeta);
        })
    })
})
