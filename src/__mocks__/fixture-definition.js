export function depFn() { return new Promise((resolve) => resolve('depFn.value')) }
depFn.__factory = ['depFn'];

export class DepClass {
    test() {
        return 'DepClass.value'
    }
}
DepClass.__class = ['DepClass', ['state', 'a', 'b1']];

export function waitFn1() {}
export function waitFn2() {}

export function testFunc(depClass, depFnValue) {
    if (!(depClass instanceof DepClass)) {
        throw new Error('arg is not an instance of DepClass')
    }
    return 'testFunc.value.' + depClass.test() + '.' + depFnValue
}
const ignore = (p) => p.catch(() => {})
testFunc.__factory = ['testFunc', DepClass, [depFn, ignore], ['state', 'a', 'b']];
testFunc.__waitFor = [waitFn1, waitFn2];

export let testFuncMeta = {
    id: 'testFunc',
    handler: testFunc,
    deps: [
        {
            definition: DepClass,
            path: [],
            promiseHandler: null
        },
        {
            definition: depFn,
            path: [],
            promiseHandler: ignore
        },
        {
            definition: null,
            path: ['state', 'a', 'b'],
            promiseHandler: null
        }
    ],
    waitFor: [{
        definition: waitFn1,
        path: [],
        promiseHandler: null
    }, {
        definition: waitFn2,
        path: [],
        promiseHandler: null
    }],
    name: 'testFunc'
};
