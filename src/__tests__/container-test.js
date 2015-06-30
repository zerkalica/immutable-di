import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'
import {Factory, Class, Faset} from '../define'
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
            class Test {

            }

            const instance1 = container.get(Test)
            const instance2 = container.get(Test)

            assert(instance1, instance2)
        })

        it('should cache factory return value', () => {
            const Fac1 = Factory()(function _Fac1() {
                return 123
            })

            const instance1 = container.get(Fac1)
            assert.strictEqual(instance1, 123)
        })

        it('should handle simple deps from array definition', () => {
            const Fac1 = Factory()(function _Fac1() {
                return 123
            })

            @Class([Fac1])
            class Test {
            }
            const TestFake = sinon.spy(Test)
            container.get(TestFake)
            assert(TestFake.calledWith(123))
        })

        it('should handle simple deps from object definition', () => {
            const Fac1 = Factory()(function _Fac1() {
                return 123
            })

            @Class({fac: Fac1})
            class Test {
            }
            const TestFake = sinon.spy(Test)
            container.get(TestFake)
            assert(TestFake.calledWith({fac: 123}))
        })

        it('should handle state changes', () => {
            const Fac1 = Factory([
                ['todo', 'id']
            ])(function _Fac1(id) {
                return id
            })

            @Class([Fac1])
            class Test {
            }
            const TestFake = sinon.spy(Test)
            container.get(TestFake)
            container.select(['todo']).set('id', 321)
            container.get(TestFake)
            assert(TestFake.firstCall.calledWith(0))
            // assert(TestFake.secondCall.calledWith(1))
        })

    })

})
