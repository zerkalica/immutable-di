import Container from '../container'
import MetaInfoCache from '../meta-info-cache'
import NativeAdapter from '../state-adapters/native-adapter'
import GenericAdapter from '../definition-adapters/generic-adapter'
import {testFunc} from '../__mocks__/fixture-definition'

describe('container', () => {
    let state = {
        p: {
            a: 'test-state-val'
        }
    };
    let globalCache;
    let container;

    beforeEach(() => {
        globalCache = new Map()
        container = new Container({
            state: new NativeAdapter(state),
            metaInfoCache: new MetaInfoCache(GenericAdapter),
            globalCache: globalCache
        })
    })

    describe('if wrong arguments passed', () => {
      it('should throw exception if no argument passed', () => {
        const msg = 'Getter is not a definition in unk';
        (() => container.get()).should.throw(msg);
      })

      it('should throw exception if null argument passed', () => {
        const msg = 'Getter is not a definition in unk';
        (() => container.get(null)).should.throw(msg);
        (() => container.get('')).should.throw(msg);
        (() => container.get(0)).should.throw(msg);
        (() => container.get(false)).should.throw(msg);
      })

      it('should throw exception if not service prototype passed', () => {
        function TestService() {
        }
        (() => container.get(container, TestService)).should.throw();
      })

      it('should throw exception if no service name defined', () => {
        function TestService() {
            return 123;
        }
        (() => container.get(TestService)).should.throw('Property .__factory or .__class not exist in unk');
      })
    })

    describe('if correct service prototype passed', () => {
        it('should instance simple service as promise', () => {
            function TestService() {
                return 1234;
            }
            TestService.__factory = ['TestService'];
            container.get(TestService).should.instanceOf(Promise);
        })

        it('should resolve deps for simple class', () => {
            function testFactory() {
                return new Promise(resolve => resolve('testFactory.value'));
            }
            testFactory.__factory = ['testFactory'];

            class TestClass {
                static __class = ['TestClass', testFactory]
                constructor(testFactoryValue) {
                    this.tfv = testFactoryValue
                }

                get() {
                    return 'TestClass.' + this.tfv
                }
            }
            const v = container.get(TestClass).then(testClass => testClass.get())

            return v.should.eventually.to.equal('TestClass.testFactory.value')
        })

        it('should instance complex service with deps and return value', () => {
            return container.get(testFunc).should.eventually.to.equal('testFunc.value.DepClass.value.depFn.value')
        })

        it('should resolve state path as dep', () => {
            var exampleValue = 'test-va';

            function Dep(pa) {
              return exampleValue + '.' + pa;
            }
            Dep.__factory = ['Dep', ['p', 'a']];

            return container.get(Dep).should.eventually.equal(exampleValue + '.' + state.p.a);
        });

        it('should instance simple service and put it in global cache', () => {
            let exampleValue = 'test';
            function TestService2() {
              return new Promise(resolve => resolve(exampleValue));
            }
            TestService2.__factory = ['TestService2'];
            container.get(TestService2);

            return globalCache.get('TestService2').should.eventually.equal(exampleValue);
        });

        it('should instance simple service and put it in state cache', () => {
            var exampleValue = 'test-va';

            function Dep(pa) {
              return exampleValue + '.' + pa;
            }
            Dep.__factory = ['Dep', ['p', 'a']];

            container.get(Dep);

            const localCache = container._cache.get('state');

            localCache.should.to.be.instanceOf(Map)

            return localCache.get('Dep').should.eventually.equal(exampleValue + '.' + state.p.a);
        });

   })
})
