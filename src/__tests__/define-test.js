import {getDef, Class, Factory} from '../define'
import {describe, it, spy} from '../test-helper'

describe('define', () => {
    it('getDef should return .__di property', () => {
        class TestSrv {

        }
        TestSrv.__di = 'test'

        getDef(TestSrv).should.to.be.equal('test')
    })

    it('Class should define class service', () => {
        class T1 {

        }
        Class(T1)
        T1.__di.should.to.be.include.keys(['id', 'isClass', 'scope', 'deps'])
    })

    it('Factory should define class service', () => {
        function F1() {
        }
        Factory(F1)
        F1.__di.should.to.be.include.keys(['id', 'isClass', 'scope', 'deps'])
    })

    it('should handle deps with promises', () => {
        function depFn() {
            return new Promise((resolve) => resolve('depFn.value'))
        }
        Factory(depFn)

        class DepClass {
            test() {
                return 'DepClass.value'
            }
        }
        Class(DepClass, ['state.a.b'])

        function testObjectDeps({depClass, depFnValue}) {
            if (!(depClass instanceof DepClass)) {
                throw new Error('arg is not an instance of DepClass')
            }
            return 'testFunc.value.' + depClass.test() + '.' + depFnValue
        }

        function ph(p) {
            return p.catch(err => err)
        }

        Factory(testObjectDeps, {
            depFnValue: depFn,
            depClass: [DepClass, ph]
        })

        const def = testObjectDeps.__di

        def.id.should.be.match(/^testObjectDeps.*/)
        def.scope.should.be.equal('state')
        def.deps.should.be.a('array').and.to.have.length(2)
        def.should.have.deep.property('deps.0.name', 'depFnValue')
        def.should.have.deep.property('deps.0.promiseHandler', null)
        def.should.have.deep.property('deps.0.path', null)
        def.should.have.deep.property('deps.0.definition', depFn)

        def.should.have.deep.property('deps.1.name', 'depClass')
        def.should.have.deep.property('deps.1.promiseHandler', ph)
        def.should.have.deep.property('deps.1.path', null)
        def.should.have.deep.property('deps.1.definition', DepClass)
    })
})
