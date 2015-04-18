import ContainerCreator from '../container-creator'
import NativeAdapter from '../state-adapters/native-adapter'
import {describe, it, spy, sinon, getClass} from '../test-helper'
import {Factory, Class, Promises, WaitFor} from '../define'

describe('container', () => {
    let state = {
        state: {a: {b: 1, b1: 2}},
        p: {
            a: 'test-state-val'
        }
    };
    let creator
    let container

    function depFn() {
        return new Promise((resolve) => resolve('depFn.value'))
    }
    Factory(depFn)

    function waitFn1() {}
    Factory(waitFn1)

    function waitFn2() {}
    Factory(waitFn2)

    class DepClass {
        test() {
            return 'DepClass.value'
        }
    }
    Class(DepClass, ['state.a.b'])

    function testFunc(depClass, depFnValue) {
        if (!(depClass instanceof DepClass)) {
            throw new Error('arg is not an instance of DepClass')
        }
        return 'testFunc.value.' + depClass.test() + '.' + depFnValue
    }
    Factory(testFunc, [DepClass, [depFn, Promises.ignore]])
    WaitFor(testFunc, [waitFn1, waitFn2])

    function testObjectDeps({depClass, depFnValue}) {
        if (!(depClass instanceof DepClass)) {
            throw new Error('arg is not an instance of DepClass')
        }
        return 'testFunc.value.' + depClass.test() + '.' + depFnValue
    }
    Factory(testObjectDeps, {
        depFnValue: depFn,
        depClass: DepClass
    })

    beforeEach(() => {
        creator = new ContainerCreator()
        container = creator.create(new NativeAdapter(state))
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
            (() => container.get(TestService)).should.throw('Property .__id not exist in unk')
        })
    })

    describe('if correct service prototype passed', () => {
        it('should instance simple service as promise', () => {
            function TestService() {
                return 1234
            }
            Factory(TestService)
            container.get(TestService).should.instanceOf(Promise)
        })

        it('should resolve deps for simple class', () => {
            function testFactory() {
                return new Promise(resolve => resolve('testFactory.value'));
            }
            Factory(testFactory)

            class TestClass {
                constructor(testFactoryValue) {
                    this.tfv = testFactoryValue
                }

                get() {
                    return 'TestClass.' + this.tfv
                }
            }
            Class(TestClass, [testFactory])
            const v = container.get(TestClass).then(testClass => testClass.get())

            return v.should.eventually.to.equal('TestClass.testFactory.value')
        })

        it('should instance complex service with deps and return value', () => {
            return container.get(testFunc).should.eventually.to.equal('testFunc.value.DepClass.value.depFn.value')
        })

        it('should instance complex service with deps as object and return value', () => {
            return container.get(testObjectDeps).should.eventually.to.equal(
                'testFunc.value.DepClass.value.depFn.value')
        })

        it('should resolve state path as dep', () => {
            var exampleValue = 'test-va';

            function Dep(pa) {
              return exampleValue + '.' + pa
            }
            Factory(Dep, ['p.a'])

            return container.get(Dep).should.eventually.equal(exampleValue + '.' + state.p.a)
        })

        it('should throw error, if path not found in state', () => {
            var exampleValue = 'test-va';

            function Dep(pa) {
                return exampleValue + '.' + pa
            }
            Factory(Dep, 'f.a')
            return (() => container.get(Dep)).should.throw()
        })


        it('should instance simple service and put it in global cache', () => {
            let exampleValue = 'test';
            function TestService2() {
              return new Promise(resolve => resolve(exampleValue));
            }
            Factory(TestService2)
            container.get(TestService2)
            const globalCache = creator._globalCache

            return globalCache.get(TestService2.__di.id).should.eventually.equal(exampleValue)
        })

        it('should instance simple service and put it in state cache', () => {
            var exampleValue = 'test-va';

            function Dep(pa) {
              return exampleValue + '.' + pa
            }
            Factory(Dep, ['p.a'])

            container.get(Dep);

            const localCache = container._cache.get('p');
            localCache.should.to.be.instanceOf(Map)

            return localCache.get(Dep.__di.id).should.eventually.equal(exampleValue + '.' + state.p.a)
        })

        it('should use cache, if called twice or more', () => {
            const Dep = spy()
            Factory(Dep, ['p.a'])

            return container.get(Dep).then(d => {
                return container.get(Dep)
            }).then(d => {
                Dep.should.have.been.calledOnce;
            });
        })

        it('should compute state-depended value again after clear cache', () => {
            const Dep = spy()
            Factory(Dep, ['p.a'])

            return container.get(Dep).then(d => {
                container.clear('p')
                return container.get(Dep)
            }).then(d => {
                Dep.should.have.been.calledTwice;
            })
        })

        it('should compute global-depended value again after clear cache', () => {
            const Dep = spy()
            Factory(Dep)

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
        })

        it('should transform state', () => {
            const depFn = spy()
            const Dep = (state) => {
                depFn();
                return state;
            }
            Factory(Dep, ['state'])
            const mutations = [
                {
                    id: 'state', data: {a: {b: 2}}
                }
            ]

            return container.get(Dep)
                .then(function(data) {
                    data.should.be.deep.equal({a: {b: 1, b1: 2}})

                    container.transformState(mutations)
                    return container.get(Dep)
                })
                .then(function (data) {
                    container.get(Dep)
                    depFn.should.be.calledTwice
                    return data
                })
                .then(function (data) {
                    data.should.deep.equal({a: {b: 2}})
                })
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
            Factory(Dep, ['p.a'])

            function TestService(dep) {
              return new Promise.resolve(dep);
            }
            Factory(TestService, [
                [Dep, p => p.catch(err => testFallback)],
            ])

            container.get(TestService).should.eventually.deep.equal(testFallback)
        })

        it('should filter exception, if service throws custom exception', () => {
            const testErr = {test: 123};
            function Dep() {
                throw new ReferenceError('test')
            }
            Factory(Dep)

            function TestService(dep) {
              return new Promise.resolve(dep);
            }
            Factory(TestService, [
                [Dep, p => p.catch(ReferenceError, err => testErr)]
            ])

            container.get(TestService).should.eventually.deep.equal(testErr);
        })
    })
})
