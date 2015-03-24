import proxyquire from 'proxyquire'
import NativeAdapter from '../state-adapters/native-adapter'

function getClass(methods) {
    let Class = spy();
    Class.prototype.constructor = Class;
    (methods || []).forEach((method) => {
        Class.prototype[method] = spy();
    })

    return Class.prototype;
}

describe('container-creator', () => {
    let Creator, FakeContainer, FakeMetaInfoCache, FakeGenericAdapter, testState

    beforeEach(() => {
        testState = new NativeAdapter({
            a: {
                b: 123
            }
        })

        FakeContainer = getClass(['get', 'clear'])
        FakeMetaInfoCache = getClass()
        FakeGenericAdapter = getClass()
        Creator = proxyquire('../container-creator', {
            './container': FakeContainer.constructor,
            './meta-info-cache': FakeMetaInfoCache.constructor,
            './definition-adapters/generic-adapter': FakeGenericAdapter.constructor
        })
    })

    it('should return factory for building ImmutableDi containers', () => {
        const creator = new Creator()

        creator.create.should.be.a('function')
    })

    it('should build ImmutableDi container', () => {
        const creator = new Creator()
        const m = sinon.match;
        creator.create(testState)
        FakeContainer.constructor.should.calledWith(
            m.has('state', testState)
                .and(m.has('globalCache', m.instanceOf(Map)))
                .and(m.has('metaInfoCache', m.instanceOf(FakeMetaInfoCache.constructor)))
        );
    })

    it('should call get method of container', () => {
        const di = (new Creator()).create(testState)
        di.get('test2')
        FakeContainer.get.should.have.been.calledWith('test2');
    })
});
