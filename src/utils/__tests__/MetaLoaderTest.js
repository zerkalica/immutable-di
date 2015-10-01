/* eslint-env mocha */
import assert from 'power-assert'
import MetaLoader from '../MetaLoader'
import DefaultDefinitionDriver from '../../drivers/DefaultDefinitionDriver'
const {Factory, Path} = DefaultDefinitionDriver.annotations

function cmpArr(a1, a2) {
    return JSON.stringify(a1.sort()) === JSON.stringify(a2.sort())
}

function getLoader() {
    return new MetaLoader(new DefaultDefinitionDriver())
}

describe('MetaLoaderTest', () => {
    it('B->a, A->a, B->A: to a: [A, B]', () => {
        const DepA = Factory([['a']])(v => v)
        const DepB = Factory([DepA, ['a']])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'

        const loader = getLoader()
        loader.getMeta(DepB)
        assert.deepEqual(loader.pathToIdsMap, {
            '.a': [ 'A', 'B' ],
            '.a.*': [ 'A', 'B' ]
        })
    })

    it('A->C, A->B, B->C, C->a, B->b to a: [A, B, C], b: [A, B]', () => {
        const DepC = Factory([['a']])(v => v)
        const DepB = Factory([DepC, ['b']])(v => v)
        const DepA = Factory([DepC, DepB])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'
        DepC.__di.id = 'C'

        const loader = getLoader()
        loader.getMeta(DepA)
        assert.deepEqual(loader.pathToIdsMap, {
            '.a': [ 'C', 'B', 'A' ],
            '.a.*': [ 'C', 'B', 'A' ],
            '.b': [ 'B', 'A' ],
            '.b.*': [ 'B', 'A' ]
        })
    })

    it('A->C, A->B, B->C, C->a, B->b, then add D->B to a: [A, B, C, D], b: [A, B, D]', () => {
        const DepC = Factory([['a']])(v => v)
        const DepB = Factory([DepC, ['b']])(v => v)
        const DepA = Factory([DepC, DepB])(v => v)
        const DepD = Factory([DepB])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'
        DepC.__di.id = 'C'
        DepD.__di.id = 'D'

        const loader = getLoader()
        loader.getMeta(DepA)
        loader.getMeta(DepD)

        assert.deepEqual(loader.pathToIdsMap, {
            '.a': [ 'C', 'B', 'A', 'D' ],
            '.a.*': [ 'C', 'B', 'A', 'D' ],
            '.b': [ 'B', 'A', 'D' ],
            '.b.*': [ 'B', 'A', 'D' ]
        })
    })

    it('B->A, C->A, A->a to a: [A, B, C]', () => {
        const DepA = Factory([['a']])(v => v)
        const DepB = Factory([DepA])(v => v)
        const DepC = Factory([DepA])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'
        DepC.__di.id = 'C'

        const loader = getLoader()
        loader.getMeta(DepB)
        loader.getMeta(DepC)

        assert.deepEqual(loader.pathToIdsMap, {
            '.a': [ 'A', 'B', 'C' ],
            '.a.*': [ 'A', 'B', 'C' ]
        })
    })

    it('B->A, C->B, A->a to a: [A, B, C]', () => {
        const DepA = Factory([['a']])(v => v)
        const DepB = Factory([DepA])(v => v)
        const DepC = Factory([DepB])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'
        DepC.__di.id = 'C'

        const loader = getLoader()
        loader.getMeta(DepB)
        loader.getMeta(DepC)

        assert.deepEqual(loader.pathToIdsMap, {
            '.a': [ 'A', 'B', 'C' ],
            '.a.*': [ 'A', 'B', 'C' ]
        })
    })

    it('B->A, A->a.b, B->a to a: [A, B], a.b: [A, B]', () => {
        const DepA = Factory([['a', 'b']])(v => v)
        const DepB = Factory([DepA, ['a']])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'

        const loader = getLoader()
        loader.getMeta(DepB)
        assert.deepEqual(loader.pathToIdsMap, {
            '.a': [ 'A', 'B' ],
            '.a.b': [ 'A', 'B' ],
            '.a.b.*': [ 'A', 'B' ],
            '.a.*': [ 'B' ]
        })
    })

    it('B->a, A->a.b, C->a.c to a: [A, B, C], a.b: [A], a.c: [C]', () => {
        const DepA = Factory([['a', 'b']])(v => v)
        const DepB = Factory([['a']])(v => v)
        const DepC = Factory([['a', 'c']])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'
        DepC.__di.id = 'C'

        const loader = getLoader()
        loader.getMeta(DepB)
        loader.getMeta(DepA)
        loader.getMeta(DepC)

        assert.deepEqual(loader.pathToIdsMap, {
            '.a': [ 'B', 'A', 'C' ],
            '.a.*': [ 'B' ],
            '.a.b': [ 'A' ],
            '.a.b.*': [ 'A' ],
            '.a.c': [ 'C' ],
            '.a.c.*': [ 'C' ]
        })
    })

    it('B->A, A->a, B->b to a: [A, B], b: [B]', () => {
        const DepA = Factory([['a']])(v => v)
        const DepB = Factory([DepA, ['b']])(v => v)
        DepA.__di.id = 'A'
        DepB.__di.id = 'B'

        const loader = getLoader()
        loader.getMeta(DepB)
        assert.deepEqual(loader.pathToIdsMap, {
            '.a': [ 'A', 'B' ],
            '.a.*': [ 'A', 'B' ],
            '.b': [ 'B' ],
            '.b.*': [ 'B' ]
        })
    })
})
/*
A - a.b.c, B - a, C - a.b.d, D - a.b

a -> ABCD
a.b -> ABCD
a.b.c -> ABD
a.b.d -> BCD


*/
