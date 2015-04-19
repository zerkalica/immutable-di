import {describe, it, spy, sinon, getClass} from '../../test-helper'
import {Factory, Class, Promises, WaitFor} from '../../define'

import Dispatcher from '../dispatcher'

describe('flux/dispatcher', () => {
    let dispatcher
    let container

    let Store1
    let Store2
    let fakeStoreHandle
    let fakeTransformState
    let fakeCreateMethod
    let fakeGet

    const testAction = 'test'
    const testPayload = {test: 111}

    beforeEach(() => {
        fakeStoreHandle = spy()
        fakeTransformState = spy()
        fakeCreateMethod = spy()
        fakeGet = spy()
        container = {
            transformState: fakeTransformState,
            get(def) {
                fakeGet(def)
                return def()
            },
            createMethod(...args) {
                fakeCreateMethod(...args)
                return {
                    handle: (store) => {
                        fakeStoreHandle(store);
                        return {id: 'test', data: {test: 1}};
                    }
                }
            }
        }
        dispatcher = new Dispatcher(container)
        Store1 = getClass(['handle'])
        Class(Store1)
        Store2 = getClass(['handle'])
        Class(Store2)
        dispatcher.setStores([Store1, Store2])
    })

    describe('dispatch', () => {
        it('should create invoker instance if action dispatched', () => {
            return dispatcher.dispatch(testAction, testPayload)
                .then(() => {
                    fakeCreateMethod.should.have.been.calledOnce
                        .and.calledWith(testAction, testPayload);
                })
        })

        it('should pass stores to handle', () => {
            return dispatcher.dispatch(testAction, testPayload)
                .then(() => {
                    fakeStoreHandle.should.have.been.calledTwice;
                    fakeStoreHandle.firstCall.should.calledWith(Store1)
                    fakeStoreHandle.secondCall.should.calledWith(Store2)
                })
        })

    })

    describe('mount', () => {
        it('should return listener definition', () => {
            const listener = spy()
            const DefFn = spy()
            Factory(DefFn)
            dispatcher.mount(DefFn, listener).should.to.be.a('function')
        })

        it('should call get if mount listener', () => {
            const listener = spy()
            const DefFn = spy()
            Factory(DefFn)
            const listenerDef = dispatcher.mount(DefFn, listener)

            return dispatcher.dispatch(testAction, testPayload)
                .then(() => {
                    fakeGet.should.have.been.calledWith(listenerDef);
                })
        })

        it('should not call get if unmount listener', () => {
            const listener = spy()
            const DefFn = spy()
            Factory(DefFn)
            const listenerDef = dispatcher.mount(DefFn, listener)
            dispatcher.unmount(listenerDef)

            return dispatcher.dispatch(testAction, testPayload)
                .then(() => {
                    fakeGet.should.not.have.been.called;
                })
        })
    })
})
