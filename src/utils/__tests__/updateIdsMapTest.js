/* eslint-env mocha */
import assert from 'power-assert'
import {Factory} from '../../define'
import updateIdsMap from '../updateIdsMap'

function cmpArr(a1, a2) {
    return JSON.stringify(a1.sort()) === JSON.stringify(a2.sort())
}

describe('updateIdsMap', () => {
    it('B->a, A->a, B->A: to a: [A, B]', () => {
        const pathToIdsMap = {}
        const idToPathsMap = {}
        const DepA = Factory([['a']])(v => v)
        const DepB = Factory([DepA, ['a']])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'

        updateIdsMap(DepB, pathToIdsMap, idToPathsMap)
        assert(cmpArr(pathToIdsMap.a, ['A', 'B']))
    })

    it('A->C, A->B, B->C, C->a, B->b to a: [A, B, C], b: [A, B]', () => {
        const pathToIdsMap = {}
        const idToPathsMap = {}
        const DepC = Factory([['a']])(v => v)
        const DepB = Factory([DepC, ['b']])(v => v)
        const DepA = Factory([DepC, DepB])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'
        DepC.__di.id = 'C'

        updateIdsMap(DepA, pathToIdsMap, idToPathsMap)
        assert(cmpArr(pathToIdsMap.a, ['A', 'B', 'C']))
        assert(cmpArr(pathToIdsMap.b, ['A', 'B']))
    })

    it('A->C, A->B, B->C, C->a, B->b, then add D->B to a: [A, B, C, D], b: [A, B, D]', () => {
        const pathToIdsMap = {}
        const idToPathsMap = {}
        const DepC = Factory([['a']])(v => v)
        const DepB = Factory([DepC, ['b']])(v => v)
        const DepA = Factory([DepC, DepB])(v => v)
        const DepD = Factory([DepB])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'
        DepC.__di.id = 'C'
        DepD.__di.id = 'D'

        updateIdsMap(DepA, pathToIdsMap, idToPathsMap)
        updateIdsMap(DepD, pathToIdsMap, idToPathsMap)
        assert(cmpArr(pathToIdsMap.a, ['A', 'B', 'C', 'D']))
        assert(cmpArr(pathToIdsMap.b, ['A', 'B', 'D']))
    })

    it('B->A, C->A, A->a to a: [A, B, C]', () => {
        const pathToIdsMap = {}
        const idToPathsMap = {}
        const DepA = Factory([['a']])(v => v)
        const DepB = Factory([DepA])(v => v)
        const DepC = Factory([DepA])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'
        DepC.__di.id = 'C'

        updateIdsMap(DepB, pathToIdsMap, idToPathsMap)
        updateIdsMap(DepC, pathToIdsMap, idToPathsMap)
        assert(cmpArr(pathToIdsMap.a, ['A', 'B', 'C']))
    })

    it('B->A, C->B, A->a to a: [A, B, C]', () => {
        const pathToIdsMap = {}
        const idToPathsMap = {}
        const DepA = Factory([['a']])(v => v)
        const DepB = Factory([DepA])(v => v)
        const DepC = Factory([DepB])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'
        DepC.__di.id = 'C'

        updateIdsMap(DepB, pathToIdsMap, idToPathsMap)
        updateIdsMap(DepC, pathToIdsMap, idToPathsMap)
        assert(cmpArr(pathToIdsMap.a, ['A', 'B', 'C']))
    })

    it('B->A, A->a.b, B->a to a: [A, B], a.b: [A, B]', () => {
        const pathToIdsMap = {}
        const idToPathsMap = {}
        const DepA = Factory([['a', 'b']])(v => v)
        const DepB = Factory([DepA, ['a']])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'

        updateIdsMap(DepB, pathToIdsMap, idToPathsMap)
        assert(cmpArr(pathToIdsMap.a, ['A', 'B']))
        assert(cmpArr(pathToIdsMap['a.b'], ['A', 'B']))
    })

    it('B->A, A->a, B->b to a: [A, B], b: [B]', () => {
        const pathToIdsMap = {}
        const idToPathsMap = {}
        const DepA = Factory([['a']])(v => v)
        const DepB = Factory([DepA, ['b']])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'

        updateIdsMap(DepB, pathToIdsMap, idToPathsMap)
        assert(cmpArr(pathToIdsMap.a, ['A', 'B']))
        assert(cmpArr(pathToIdsMap.b, ['B']))
    })
})
