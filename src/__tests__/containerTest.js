/* eslint-env mocha */
import assert from 'power-assert'
import Container from '../container'
import NativeCursor from '../cursors/native'
import {Factory, Class, Getter, Setter} from '../define'
import sinon from 'sinon'

describe('container', () => {
    let container
    let cursor
    const initialState = {
        todo: {
            id: 0,
            todos: []
        }
    }

    beforeEach(() => {
        cursor = new NativeCursor({todo: {...initialState.todo}})
        container = new Container(cursor)
    })

    describe('basics', () => {
        it('should throws exception if incorrect data passed to constructor', () => {
            assert.throws(() => new Container(), /instance/)
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

        /* eslint-disable padded-blocks */
        it('should return class instance', () => {
            @Class()
            class Test {
            }
            const instance = container.get(Test)
            assert(instance instanceof Test)
        })
        /* eslint-enable padded-blocks */

        /* eslint-disable padded-blocks */
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
        /* eslint-enable padded-blocks */

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
    })

    describe('selection', () => {
        it('select should return instance of Cursor', () => {
            assert(cursor.select(['todo', 'id']) instanceof NativeCursor)
        })

        it('should throw error if node does not exists in the middle of path', () => {
            assert.throws(() => cursor.select(['todo', 'id2', 'id']).get(), /path/)
        })
    })
})
