/* eslint-env mocha */
import assert from 'power-assert'
import {Factory} from '../../define'
import updateIdsMap from '../updateIdsMap'

function cmpArr(a1, a2) {
    return JSON.stringify(a1.sort()) === JSON.stringify(a2.sort())
}

describe('updateIdsMap', () => {
    it('(B->a)->(A->a): to a: [A, B]', () => {
        const pathToIdsMap = {}
        const idToPathsMap = {}
        const DepA = Factory([['a']])(v => v)
        const DepB = Factory([DepA, ['a']])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'

        updateIdsMap(DepB, pathToIdsMap, idToPathsMap)
        assert(cmpArr(pathToIdsMap.a, ['A', 'B']))
    })

    it('B->(A->a), C->(A->a) to a: [A, B, C]', () => {
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
})
