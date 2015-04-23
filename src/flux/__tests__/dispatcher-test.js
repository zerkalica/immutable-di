import {describe, it, spy, sinon, getClass} from '../../test-helper'
import {Factory, Class, Promises, WaitFor} from '../../define'

import Dispatcher from '../dispatcher'

describe('flux/dispatcher', () => {
    let dispatcher
    let container

    let Store1
    let Store2
    let fakeTransformState
    let fakeGet

    const testAction = 'test'
    const testPayload = {test: 111}

    beforeEach(() => {
        fakeTransformState = sinon.stub()
        fakeTransformState.returns([])
        fakeGet = spy()
        container = {
            transformState: fakeTransformState,
            getSync(def) {
                fakeGet(def)
                return def()
            }
        }
        Store1 = getClass(['handle'])
        Class(Store1)
        Store2 = getClass(['handle'])
        Class(Store2)

        dispatcher = new Dispatcher({
            stores: {
                Store1: Store1,
                Store2: Store2
            },
            container: container
        })
    })

    describe('dispatch', () => {

        it('should pass stores to handle', () => {
            return dispatcher.dispatch(testAction, testPayload)
                .then(() => {
                    fakeTransformState.should.have.been.calledOnce;
                    //fakeStoreHandle.firstCall.should.calledWith(Store1)
                    //fakeStoreHandle.secondCall.should.calledWith(Store2)
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

        it.skip('should call get if mount listener', () => {
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
