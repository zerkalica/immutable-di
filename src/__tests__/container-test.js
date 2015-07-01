import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'
import {Factory, Class, Facet} from '../define'
import sinon from 'sinon'

describe('container', () => {
    let container
    const initialState = {
        todo: {
            id: 0,
            todos: []
        }
    }

    beforeEach(() => {
        container = new Container(new NativeCursor(initialState))
    })

    describe('basics', () => {
        it('should throws exception if incorrect data passed to constructor', () => {
            assert.throws(() => new Container(), /undefined/)
        })
    })

    describe('get', () => {
        it('should throws exception if no arguments passed', () => {
            assert.throws(() => container.get())
        })

        it('should throws exception if no decorated function passed', () => {
            function WrongDep() {

            }

            assert.throws(() => container.get(WrongDep))
        })

        it('should return class instance', () => {
            @Class()
            class Test {

            }

            const instance = container.get(Test)

            assert(instance instanceof Test)
        })

        it('should cache class instance', () => {
            @Class()
            class TestBase {

            }
            const Test = sinon.spy(TestBase)


            const instance1 = container.get(Test)
            const instance2 = container.get(Test)

            assert.strictEqual(instance1, instance2)
            assert(Test.calledOnce)
        })

        it('should cache factory return value', () => {
            const MyDep = Factory()(function _MyDep() {
                return 123
            })

            const instance1 = container.get(MyDep)
            assert.strictEqual(instance1, 123)
        })

        it('should handle simple deps from array definition', () => {
            const MyDep = Factory()(function _MyDep() {
                return 123
            })

            @Class([MyDep])
            class Test {
            }
            const TestFake = sinon.spy(Test)
            container.get(TestFake)
            assert(TestFake.calledWith(123))
        })

        it('should handle simple deps from object definition', () => {
            const MyDep = Factory()(function _MyDep() {
                return 123
            })

            @Class({fac: MyDep})
            class Test {
            }
            const TestFake = sinon.spy(Test)
            container.get(TestFake)
            assert(TestFake.calledWith({fac: 123}))
        })

        it('should handle state changes', () => {
            const MyDep = Factory([
                ['todo', 'id']
            ])(function _MyDep(id) {
                return id
            })

            @Class([MyDep])
            class Test {}
            const TestFake = sinon.spy(Test)
            container.get(TestFake)
            container.select(['todo']).set('id', 321).commit()
            container.get(TestFake)
            container.get(TestFake)
            assert(TestFake.calledTwice)
            assert(TestFake.firstCall.calledWith(0))
            assert(TestFake.secondCall.calledWith(321))
        })
    })

    describe('selection', () => {
        it.skip('should update state on next timer tick', () => {
            const MyDep = sinon.spy(Factory([
                ['todo', 'id']
            ])(function _MyDep(id) {
                //assert(id === 321)
                //done()
                return id
            }))

            container.get(MyDep)
            container.select(['todo']).set('id', 321)
            assert(container.get(MyDep) === 0)
            //container.mount(MyDep)
            //assert(MyDep.calledOnce)
        })
    })

    describe('events', () => {
        it('should update mounted listener', done => {
            const MyDep = sinon.spy(Factory([
                ['todo', 'id']
            ])(function _MyDep(id) {
                assert(id === 321)
                done()
                return id
            }))

            container.mount(MyDep)
            container.select(['todo']).set('id', 321)
        })

        it('should not update listener with another path', () => {
            const MyDep = sinon.spy(Factory([
                ['todo', 'id']
            ])(function _MyDep(id) {
                return id
            }))

            container.mount(MyDep)
            container.select(['todo']).set('id2', 321).commit()
            assert(MyDep.notCalled)
        })

        it('should not update unmounted listener', () => {
            const MyDep = sinon.spy(Factory([
                ['todo', 'id']
            ])(function _MyDep(id) {
                assert(id === 321)
                done()
                return id
            }))

            container.mount(MyDep)
            container.unmount(MyDep)
            container.select(['todo']).set('id', 321).commit()
            assert(MyDep.notCalled)
        })
    })
})
