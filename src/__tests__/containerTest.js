/* eslint-env mocha */
import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'
import {Factory, Class} from '../define'
import sinon from 'sinon'

describe('containerTest', () => {
    describe('basics', () => {
        it('should throws exception if incorrect data passed to constructor', () => {
            assert.throws(() => new Container(), /instance/)
        })
    })

    describe('get', () => {
        it('should throws exception if no arguments passed', () => {
            const cursor = new NativeCursor({})
            const container = new Container(cursor)
            assert.throws(() => container.get())
        })

        it('should throws exception if no decorated function passed', () => {
            const cursor = new NativeCursor({})
            const container = new Container(cursor)
            function WrongDep() {
            }

            assert.throws(() => container.get(WrongDep))
        })

        /* eslint-disable padded-blocks */
        it('should return class instance', () => {
            const cursor = new NativeCursor({})
            const container = new Container(cursor)
            @Class()
            class Test {
            }
            const instance = container.get(Test)
            assert(instance instanceof Test)
        })
        /* eslint-enable padded-blocks */

        /* eslint-disable padded-blocks */
        it('should cache class instance', () => {
            const cursor = new NativeCursor({})
            const container = new Container(cursor)
            @Class()
            class TestBase {

            }
            const Test = sinon.spy(TestBase)


            const instance1 = container.get(Test)
            const instance2 = container.get(Test)

            assert.strictEqual(instance1, instance2)
            assert(Test.calledOnce)
        })
        /* eslint-enable padded-blocks */

        it('should cache factory return value', () => {
            const cursor = new NativeCursor({})
            const container = new Container(cursor)
            const MyDep = Factory()(function _MyDep() {
                return 123
            })

            const instance1 = container.get(MyDep)
            assert.strictEqual(instance1, 123)
        })

        it('should handle simple deps from array definition', () => {
            const cursor = new NativeCursor({})
            const container = new Container(cursor)
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
            const cursor = new NativeCursor({})
            const container = new Container(cursor)
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
    })
})
