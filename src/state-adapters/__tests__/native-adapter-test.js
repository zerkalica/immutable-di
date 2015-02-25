import NativeAdapter from '../native-adapter'

describe('state-adapters/native-adapter', () => {
    const testState = {
        a: {
            b: {
                name: 'test-name'
            }
        }
    }
    describe('#getIn', () => {
        it('should get part of object by path', () => {
            const nativeAdapter = new NativeAdapter(testState)
            nativeAdapter.getIn(['a', 'b']).should.to.be.deep.equal(testState.a.b)
        })

        it('should throw error, if data in path not exists', () => {
            const nativeAdapter = new NativeAdapter(testState);
            (() => nativeAdapter.getIn(['a', 'c', 'b'])).should.throw();
            expect(nativeAdapter.getIn(['a', 'c'])).to.be.undefined;
        })
    })
})
