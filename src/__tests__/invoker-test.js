import Invoker from '../invoker'
import Container from '../container'
import MetaInfoCache from '../meta-info-cache'
import NativeAdapter from '../state-adapters/native-adapter'
import GenericAdapter from '../definition-adapters/generic-adapter'

describe('invoker', () => {
    let state = {
        p: {
            a: 'test-state-val'
        }
    };
    let globalCache;
    let getInvoker;

    beforeEach(() => {
        globalCache = new Map()
        const meta = new MetaInfoCache(GenericAdapter)
        const container = new Container({
            state: new NativeAdapter(state),
            metaInfoCache: meta,
            globalCache: globalCache
        })

        getInvoker = (actionType, payload) => {
            return new Invoker({
                metaInfoCache: meta,
                container: container,
                actionType: actionType,
                payload: payload
            })
        }
    })

    it('should handle simple store', () => {
        const fakeHandle = spy()
        const testAction = 'testAction'
        const testPayload = {a: 1, b: 2}

        class TestStore {
            static __class = ['TestStore']
            handle(actionType, payload) {
                return Promise.resolve(fakeHandle(actionType, payload))
            }
        }

        const invoker = getInvoker(testAction, testPayload)
        return invoker.handle(TestStore).then(d => {
            fakeHandle.should.have.been.calledOnce
                .and.calledWith(testAction, testPayload);
        })
    })

    it('should produce mutation with id and data', () => {
        const testAction = 'testAction'
        const testPayload = {a: 1, b: 2}
        const id = 'TestStore'
        const data = 'testResult'

        class TestStore {
            static __class = [id]
            handle(actionType, payload) {
                return Promise.resolve(data)
            }
        }

        const invoker = getInvoker(testAction, testPayload)
        return invoker.handle(TestStore).then(d => {
            d.should.to.be.deep.equal({id, data})
        })
    })

    describe('deps and waitFor', () => {
        let fakeHandle
        let fakeHandle1
        let fakeHandle2
        let testAction = 'testAction'
        let testPayload = {a: 1, b: 2}
        let invoker

        class TestDep1 {
            static __class = ['TestDep1']
            handle(actionType, payload) {
                return Promise.resolve(fakeHandle1(actionType, payload))
            }
        }

        class TestDep2 {
            static __class = ['TestDep2']
            static __waitFor = [TestDep1]
            handle(actionType, payload) {
                return Promise.resolve(fakeHandle2(actionType, payload))
            }
        }

        class TestStore {
            static __class = ['TestStore']
            static __waitFor = [TestDep2, TestDep1]
            handle(actionType, payload) {
                return Promise.resolve(fakeHandle(actionType, payload))
            }
        }

        beforeEach(() => {
            fakeHandle = spy()
            fakeHandle1 = spy()
            fakeHandle2 = spy()
            invoker = getInvoker(testAction, testPayload);
        })

        it('should cache handler calls', () => {
            return Promise.all([
                invoker.handle(TestDep2),
                invoker.handle(TestStore),
                invoker.handle(TestDep2),
                invoker.handle(TestDep1),
                invoker.handle(TestDep1)
            ]).then(d => {
                fakeHandle1.should.have.been.calledOnce
                    .and.calledWith(testAction, testPayload);
                fakeHandle2.should.have.been.calledOnce
                    .and.calledWith(testAction, testPayload);
                fakeHandle.should.have.been.calledOnce
                    .and.calledWith(testAction, testPayload);
            })
        })

        it('should call with order store handlers', () => {
            return Promise.all([
                invoker.handle(TestStore),
                invoker.handle(TestDep2),
                invoker.handle(TestDep1)
            ]).then(d => {
                sinon.assert.callOrder(fakeHandle1, fakeHandle2, fakeHandle)
            })
        })

        it('should produce the mutation result of passed definition', () => {
            let testResult = ['mut1', 'mut2', 'mut']
            fakeHandle = () => 'mut'
            fakeHandle1 = () => 'mut1'
            fakeHandle2 = () => 'mut2'

            return Promise.all([
                invoker.handle(TestStore),
                invoker.handle(TestDep2),
                invoker.handle(TestDep1)
            ]).then(d => {
                d[0].data.should.to.be.equal('mut')
                d[1].data.should.to.be.equal('mut2')
                d[2].data.should.to.be.equal('mut1')
            })
        })
    })
})
