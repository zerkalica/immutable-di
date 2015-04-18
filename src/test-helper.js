import sinon from 'sinon'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinonChai from 'sinon-chai'

function getClass(methods) {
    let Class = sinon.spy();
    Class.prototype.constructor = Class;
    (methods || []).forEach((method) => {
        Class.prototype[method] = spy();
    })

    return Class.prototype;
}

chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

export default ({
    sinon,
    chai,
    describe,
    it,
    getClass,
    spy: sinon.spy,
    expect: chai.expect
})
