import {extractMetaInfo, idFromDefinition} from '../generic-adapter'

describe('definition-adapters/generic-adapter', () => {
    describe('idFromDefinition', () => {
        it('should not accept empty or null', () => {
            let message = 'Getter is not a function in undefined';
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
            (() => idFromDefinition(testFunc)).should.not.throw()
        })

        it('should return mappable id from function', () => {
            function testFunc() {}
            idFromDefinition(testFunc).should.to.equal(testFunc)
        })
    })

    describe('extractMetaInfo', () => {
        it('should not accept empty or null', () => {
            let message = 'Getter is not a function in undefined';
            (() => extractMetaInfo()).should.throw(message);
            (() => extractMetaInfo(null)).should.throw(message);
            (() => extractMetaInfo(false)).should.throw(message);
            (() => extractMetaInfo(0)).should.throw(message);
            (() => extractMetaInfo('')).should.throw(message);
            (() => extractMetaInfo([])).should.throw(message);
            (() => extractMetaInfo({})).should.throw(message);
        })

        it('should throw error, if definition property is empty in argument', () => {
            let message = 'Property .__factory or .__class not exist in undefined';
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
            let message = 'Property .__factory or .__class is not an array in undefined';
            (() => extractMetaInfo(testFunc)).should.throw(message);
        })

        it('should convert simple factory definition to metainfo', () => {
            function testFunc() {}
            testFunc.__factory = ['testFunc'];
            let meta = {
                id: testFunc,
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

        it('should convert factory definition with deps to metainfo', () => {
            function depFn() {}
            depFn.__factory = ['depFn'];

            function waitFn() {}

            function testFunc() {}
            const ignore = (p) => p.catch(() => {})
            testFunc.__factory = ['testFunc', [depFn, ignore], ['state', 'a', 'b']];
            testFunc.__waitFor = [waitFn];
            let meta = {
                id: testFunc,
                handler: testFunc,
                deps: [
                    {
                        definition: depFn,
                        path: [],
                        promiseHandler: ignore
                    },
                    {
                        definition: null,
                        path: ['state', 'a', 'b'],
                        promiseHandler: null
                    }
                ],
                waitFor: [{
                    definition: waitFn,
                    path: [],
                    promiseHandler: null
                }],
                name: 'testFunc'
            };
            extractMetaInfo(testFunc).should.to.deep.equal(meta);
        })
    })
})
