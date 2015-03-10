import Container from '../container'
import MetaInfoCache from '../meta-info-cache'
import NativeAdapter from '../state-adapters/native-adapter'
import GenericAdapter from '../definition-adapters/generic-adapter'
import {testFunc} from '../__mocks__/fixture-definition'

describe('container', () => {
    let state = {
        state: {a: {b: 1, b1: 2}},
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
        (() => container.get(TestService)).should.throw()
      })


      it('should throw exception if no service name defined', () => {
        function TestService() {
            return 123
        }
        (() => container.get(TestService)).should.throw('Property .__factory or .__class not exist in unk')
      })
    })

    describe('if correct service prototype passed', () => {
        it('should instance simple service as promise', () => {
            function TestService() {
                return 1234
            }
            TestService.__factory = ['TestService']
            container.get(TestService).should.instanceOf(Promise)
        })

        it('should resolve deps for simple class', () => {
            function testFactory() {
                return new Promise(resolve => resolve('testFactory.value'));
            }
            testFactory.__factory = ['testFactory']

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
              return exampleValue + '.' + pa
            }
            Dep.__factory = ['Dep', ['p', 'a']]

            return container.get(Dep).should.eventually.equal(exampleValue + '.' + state.p.a)
        })

        it('should throw error, if path not found in state', () => {
            var exampleValue = 'test-va';

            function Dep(pa) {
                return exampleValue + '.' + pa
            }
            Dep.__factory = ['Dep', ['f', 'a']];
            (() => container.get(Dep)).should.throw();
        })

        it('should instance simple service and put it in global cache', () => {
            let exampleValue = 'test';
            function TestService2() {
              return new Promise(resolve => resolve(exampleValue));
            }
            TestService2.__factory = ['TestService2'];
            container.get(TestService2)

            return globalCache.get('TestService2').should.eventually.equal(exampleValue)
        })

        it('should instance simple service and put it in state cache', () => {
            var exampleValue = 'test-va';

            function Dep(pa) {
              return exampleValue + '.' + pa
            }
            Dep.__factory = ['Dep', ['p', 'a']]

            container.get(Dep);

            const localCache = container._cache.get('p');
            localCache.should.to.be.instanceOf(Map)

            return localCache.get('Dep').should.eventually.equal(exampleValue + '.' + state.p.a)
        })

        it('should use cache, if called twice or more', () => {
            const Dep = spy()
            Dep.__factory = ['Dep', ['p', 'a']]

            return container.get(Dep).then(d => {
                return container.get(Dep)
            }).then(d => {
                Dep.should.have.been.calledOnce;
            });
        })

        it('should compute state-depended value again after clear cache', () => {
            const Dep = spy()
            Dep.__factory = ['Dep', ['p', 'a']]

            return container.get(Dep).then(d => {
                container.clear('p')
                return container.get(Dep)
            }).then(d => {
                Dep.should.have.been.calledTwice;
            })
        })

        it('should compute global-depended value again after clear cache', () => {
            const Dep = spy()
            Dep.__factory = ['Dep']

            return container.get(Dep).then(d => {
                container.clear('global')
                return container.get(Dep)
            }).then(d => {
                Dep.should.have.been.calledTwice;
            })
        })


        it('should create invoker instance', () => {
            const testPayload = {test: 123};
            const testAction = 'testAction';
            container.createMethod(testAction, testPayload).handle.should.be.a.function
            //container.createMethod(testAction, testPayload).handle(store)
            //  container.createMethod(testAction, testPayload).handle.should
        })

        it.skip('should transform state', () => {
            const listener = spy()
            const mutations = [
                {id: 'a', data: {test: 123}},
                {id: 'b', data: undefined}
            ]

            const di = Builder([listener])(testState)
            const updatedScopes = di.transformState(mutations)
            FakeContainer.clear.should.to.be.calledOnce
                .and.to.be.calledWith('a')

            FakeContainer.get.should.to.be.calledOnce
                .and.to.be.calledWith(listener)
        })
   })

    describe('exception handling', () => {
        it('should return empty data, if service throws exception', () => {
            const exampleValue = 'test-va';
            const testFallback = {
                test: '123'
            }
            function Dep(context) {
              throw new Error('test')
              return exampleValue
            }
            Dep.__factory = ['Dep', ['p', 'a']]

            function TestService(dep) {
              return new Promise.resolve(dep);
            }
            TestService.__factory = ['TestService', [Dep, p => p.catch(err => testFallback)]]
            expect(container.get(TestService)).eventually.deep.equal(testFallback)
        })

        it('should filter exception, if service throws custom exception', () => {
            const testErr = {test: 123};
            function Dep() {
                throw new ReferenceError('test')
            }
            Dep.__factory = ['Dep'];
            function TestService(dep) {
              return new Promise.resolve(dep);
            }
            TestService.__factory = [
                'TestService',
                [Dep, p => p.catch(ReferenceError, err => testErr)]
            ]

            expect(container.get(TestService)).eventually.deep.equal(testErr);
        })
    })
})
