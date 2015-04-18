import {getDef, Def, Class, Factory, WaitFor} from '../define'
import {describe, it, spy} from '../test-helper'

describe('define', () => {
    it('getDef should return .__di property', () => {
        class TestSrv {

        }
        TestSrv.__di = 'test'

        getDef(TestSrv).should.to.be.equal('test')
    })

    it('Def should create empty service', () => {
        function fn() {

        }
        const deps = {
        }
        Def(p => p, {id: 'test-id', handler: fn, deps: deps}).should.to.be.a('function')
    })

    it('Class should define class service', () => {
        class T1 {

        }
        Class(T1)
        T1.__di.should.to.be.include.keys(['id', 'handler', 'scope', 'deps'])
    })

    it('Factory should define class service', () => {
        function F1() {
        }
        Factory(F1)
        F1.__di.should.to.be.include.keys(['id', 'handler', 'scope', 'deps'])
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

    it('should produce valid waitFor', () => {
        class TestDep1 {
            handle(actionType, payload) {
                return Promise.resolve(1)
            }
        }
        Class(TestDep1)

        class TestDep2 {
            handle(actionType, payload) {
                return Promise.resolve(2)
            }
        }
        Class(TestDep2)
        WaitFor(TestDep2, [TestDep1])

        class TestStore {
            handle(actionType, payload) {
                return Promise.resolve(3)
            }
        }
        Class(TestStore)
        WaitFor(TestStore, [TestDep2, TestDep1])
        TestStore.__di.should.have.deep.property('waitFor.0.definition', TestDep2)
        TestStore.__di.should.have.deep.property('waitFor.1.definition', TestDep1)
    })
})
