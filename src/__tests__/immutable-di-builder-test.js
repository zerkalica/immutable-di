import proxyquire from 'proxyquire'

function getClass(methods) {
    let Class = spy();
    Class.prototype.constructor = Class;
    (methods || []).forEach((method) => {
        Class.prototype[method] = spy();
    })

    return Class.prototype;
}

describe('immutable-di-builder', () => {
    let Builder, FakeContainer, FakeInvoker, FakeMetaInfoCache, FakeGenericAdapter
    const testState = {
        a: {
            b: 123
        }
    }

    beforeEach(() => {
        FakeContainer = getClass(['get', 'clear'])
        FakeInvoker = getClass()
        FakeMetaInfoCache = getClass()
        FakeGenericAdapter = getClass()
        Builder = proxyquire('../immutable-di-builder', {
            './container': FakeContainer.constructor,
            './invoker': FakeInvoker.constructor,
            './meta-info-cache': FakeMetaInfoCache.constructor,
            './definition-adapters/generic-adapter': FakeGenericAdapter.constructor
        })
    })

    it('should return factory for building ImmutableDi containers', () => {
        const fn = Builder()
        fn.should.a('function')
    })

    it('should build ImmutableDi container', () => {
        const fn = Builder();
        const m = sinon.match;
        fn(testState)
        FakeContainer.constructor.should.calledWith(
            m.has('state', testState)
                .and(m.has('globalCache', m.instanceOf(Map)))
                .and(m.has('metaInfoCache', m.instanceOf(FakeMetaInfoCache.constructor)))
        );
    })

    it('should call clear scope of container', () => {
        const di = Builder()(testState)
        di.clear('test')
        FakeContainer.clear.should.have.been.calledWith('test');
    })

    it('should call get method of container', () => {
        const di = Builder()(testState)
        di.get('test2')
        FakeContainer.get.should.have.been.calledWith('test2');
    })

    it('should create invoker instance', () => {
        const m = sinon.match;
        const di = Builder()(testState);
        const testPayload = {test: 123};
        const testAction = 'testAction';
        di.createMethod(testAction, testPayload).should.be.instanceOf(FakeInvoker.constructor);
        FakeInvoker.constructor.should.have.been.calledWith(
            m.has('actionType', testAction)
                .and(m.has('getPayload', testPayload))
                .and(m.has('container', m.instanceOf(FakeContainer.constructor)))
                .and(m.has('metaInfoCache', m.instanceOf(FakeMetaInfoCache.constructor)))
        )
    })
});
