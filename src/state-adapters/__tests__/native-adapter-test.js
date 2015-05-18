import NativeAdapter from '../native-adapter'
import {describe, it, expect} from '../../test-helper'

describe('state-adapters/native-adapter', () => {
    let testState

    beforeEach(() => {
        testState = {
            a: {
                b: {
                    name: 'test-name'
                }
            }
        }
    })

    it('should get part of object by path', () => {
        const nativeAdapter = new NativeAdapter(testState)
        nativeAdapter.getIn(['a', 'b']).should.to.be.deep.equal(testState.a.b)
    })

    it('should throw error, if data in path not exists', () => {
        const nativeAdapter = new NativeAdapter(testState);
        (() => nativeAdapter.getIn(['a', 'c', 'b'])).should.throw();
        expect(nativeAdapter.getIn(['a', 'c'])).to.be.undefined;
    })

    it('should transformState', () => {
        const nativeAdapter = new NativeAdapter(testState)
        nativeAdapter.getIn(['a', 'b']).should.to.be.deep.equal(testState.a.b)
        nativeAdapter.transformState(({get, set}) => {
            set(['a'], {c: 'test'})
        })
        nativeAdapter.getIn(['a', 'c']).should.to.equal('test')
    })
})
