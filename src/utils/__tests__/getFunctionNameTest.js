import getFunctionName from '../getFunctionName'
import assert from 'power-assert'

describe('getFunctionNameTest', () => {
    it('should return valid function name', () => {
        function test() {
        }

        assert(getFunctionName(test) === 'test')
    })

    it('should return empty function name for anonymous functions', () => {
        function test() {
        }

        assert(getFunctionName(() => 0) === '')
    })

    it('should throw error if undefined argument', () => {
        assert.throws(() => getFunctionName())
        assert.throws(() => getFunctionName(null))
    })

    it('should return empty name if empty argument', () => {
        assert.equal(getFunctionName(0), '')
        assert.equal(getFunctionName(false), '')
    })
})
