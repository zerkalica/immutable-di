import {getDebugPath, getFunctionName} from '../utils'
import {describe, it, expect} from '../test-helper'

describe('utils', () => {
    describe('getDebugPath', () => {
        it('should return string', () => {
            getDebugPath().should.to.be.equal('unk')
            getDebugPath('').should.to.be.equal('unk')
            getDebugPath([]).should.to.be.equal('unk')
        })

        it('should return valid path, if only first argument supplied', () => {
            getDebugPath(['test']).should.to.be.equal('test.unk')
        })
        it('should return valid path', () => {
            getDebugPath(['test', 'q']).should.to.be.equal('test.q')
        })
    })

    describe('getFunctionName', () => {
        it('should return function name as string', () => {
            function test(/* test */ arg1, arg2 /** test2 **/, ...args) {
            }
            const fn = getFunctionName(test)

            fn.should.to.equal('test')
        })
    })
})
