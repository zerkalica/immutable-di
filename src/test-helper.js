import sinon from 'sinon'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinonChai from 'sinon-chai'

function getClass(mock) {
    let methods = mock
    let callbacks = {}

    let Class = sinon.spy()
    Class.prototype.constructor = Class

    if (!Array.isArray(mock)) {
        methods = Object.keys(mock)
    }

    (methods || []).forEach((method) => {
        Class.prototype[method] = callbacks[method] || sinon.spy();
    })

    return Class.prototype;
}


function init() {
    chai.use(chaiAsPromised);
    chai.use(sinonChai);
    chai.should();
}

init()

export default ({
    init,
    sinon,
    chai,
    describe,
    it,
    getClass,
    spy: sinon.spy,
    expect: chai.expect
})
