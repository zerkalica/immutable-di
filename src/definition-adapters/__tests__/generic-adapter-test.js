jest.dontMock('../generic-adapter')
import {extractMetaInfo, idFromDefinition} from '../generic-adapter'

describe('definition-adapters/generic-adapter', () => {
    describe('idFromDefinition', () => {
        it('should not accept empty or null', () => {
            let message = 'Getter is not a function in getDebugPath.mock'
            expect(() => idFromDefinition()).toThrow(message)
            expect(() => idFromDefinition(null)).toThrow(message)
            expect(() => idFromDefinition(false)).toThrow(message)
            expect(() => idFromDefinition(0)).toThrow(message)
            expect(() => idFromDefinition('')).toThrow(message)
            expect(() => idFromDefinition([])).toThrow(message)
            expect(() => idFromDefinition({})).toThrow(message)
        })
        it('should accept function', () => {
            function testFunc() {}
            expect(() => idFromDefinition(testFunc)).not.toThrow()
        })
        it('should return mappable id from function', () => {
            function testFunc() {}
            expect(idFromDefinition(testFunc)).toBe(testFunc)
        })
    })

    describe('extractMetaInfo', () => {
        it('should not accept empty or null', () => {
            let message = 'Getter is not a function in getDebugPath.mock'
            expect(() => extractMetaInfo()).toThrow(message)
            expect(() => extractMetaInfo(null)).toThrow(message)
            expect(() => extractMetaInfo(false)).toThrow(message)
            expect(() => extractMetaInfo(0)).toThrow(message)
            expect(() => extractMetaInfo('')).toThrow(message)
            expect(() => extractMetaInfo([])).toThrow(message)
            expect(() => extractMetaInfo({})).toThrow(message)
        })
        it('should throw error, if definition property is empty in argument', () => {
            let message = 'Property .__factory or .__class not exist in getDebugPath.mock'
            function testFunc() {}
            expect(() => extractMetaInfo(testFunc)).toThrow(message)
            testFunc.__factory = null
            expect(() => extractMetaInfo(testFunc)).toThrow(message)
            testFunc.__factory = ''
            expect(() => extractMetaInfo(testFunc)).toThrow(message)
        })
        it('should throw error, if definition property is not an array in argument', () => {
            function testFunc() {}
            testFunc.__factory = {}
            let message = 'Property .__factory or .__class is not an array in getDebugPath.mock'
            expect(() => extractMetaInfo(testFunc)).toThrow(message)
        })

        it('should convert definition to metainfo', () => {
            function testFunc() {}
            testFunc.__factory = ['testFunc']
            let meta = {
                deps: [],
                id: testFunc,
                handler: testFunc,
                promiseHandler: null,
                name: 'testFunc'
            }
            expect(extractMetaInfo(testFunc)).toEqual(meta)
        })
    })
})
