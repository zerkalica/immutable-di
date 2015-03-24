import {isPromise, getDebugPath, classToFactory} from '../utils'

describe('utils', () => {
    describe('classToFactory', () => {
        class TestC {
        }

        class TestC1 {
            constructor(a, b) {
                if (a !== 1 || b !== 2) {
                    throw new Error('Invalid arguments');
                }
                this.c = a + b;
            }
        }

        it('should create function from class', () => {
            classToFactory(TestC).should.to.be.function;
        })

        it('should create factory function, which returns instance of class', () => {
            classToFactory(TestC)().should.to.be.instanceOf(TestC);
        })

        it('should call constructor of original class', () => {
            let factory = classToFactory(TestC1);
            (() => factory()).should.to.throw('Invalid arguments');
        })

        it('should pass arguments to constructor', () => {
            let factory = classToFactory(TestC1);
            (() => factory(1, 2)).should.not.to.throw();
            expect(factory(1, 2).c).equal(3)
        })
    })
    
    describe('getDebugPath', () => {
        it('should return string', () => {
            getDebugPath().should.to.be.equal('unk')
            getDebugPath('').should.to.be.equal('unk')
            getDebugPath([]).should.to.be.equal('unk')
        })

        it('should return valid path, if only first argument supplied', () => {
            getDebugPath(['test']).should.to.be.equal('test.unk')
        })
        it('should return valid path', () => {
            getDebugPath(['test', 'q']).should.to.be.equal('test.q')
        })
    })
})
