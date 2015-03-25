export function depFn() { return new Promise((resolve) => resolve('depFn.value')) }
depFn.__factory = ['depFn'];

export class DepClass {
    test() {
        return 'DepClass.value'
    }
}
DepClass.__class = [
    'DepClass',
    'state.a.b1'
]

export function waitFn1() {}
waitFn1.__factory = ['waitFn1']
export function waitFn2() {}
waitFn2.__factory = ['waitFn2']

export function testObjectDeps({depClass, depFnValue}) {
    if (!(depClass instanceof DepClass)) {
        throw new Error('arg is not an instance of DepClass')
    }
    return 'testFunc.value.' + depClass.test() + '.' + depFnValue
}
testObjectDeps.__factory = ['testObjectDeps', {depFnValue: depFn, depClass: DepClass}]

export let testObjectDepsMeta = {
    id: 'testObjectDeps',
    name: 'testObjectDeps',
    scope: 'state',
    handler: testObjectDeps,
    deps: [
        {
            name: 'depFnValue',
            definition: depFn,
            path: [],
            promiseHandler: null
        },
        {
            name: 'depClass',
            definition: DepClass,
            path: [],
            promiseHandler: null
        }
    ],
    waitFor: []
}

export function testFunc(depClass, depFnValue) {
    if (!(depClass instanceof DepClass)) {
        throw new Error('arg is not an instance of DepClass')
    }
    return 'testFunc.value.' + depClass.test() + '.' + depFnValue
}
const ignore = (p) => p.catch(() => {})
testFunc.__factory = ['testFunc', DepClass, [depFn, ignore], 'state.a.b'];
testFunc.__waitFor = [waitFn1, waitFn2];

export let testFuncMeta = {
    id: 'testFunc',
    handler: testFunc,
    deps: [
        {
            name: void 0,
            definition: DepClass,
            path: [],
            promiseHandler: null
        },
        {
            name: void 0,
            definition: depFn,
            path: [],
            promiseHandler: ignore
        },
        {
            name: void 0,
            definition: null,
            path: ['state', 'a', 'b'],
            promiseHandler: null
        }
    ],
    waitFor: [{
        name: void 0,
        definition: waitFn1,
        path: [],
        promiseHandler: null
    }, {
        name: void 0,
        definition: waitFn2,
        path: [],
        promiseHandler: null
    }],
    scope: 'state',
    name: 'testFunc'
};
