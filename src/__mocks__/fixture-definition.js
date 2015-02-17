export function depFn() { return new Promise((resolve) => resolve(1)) }
depFn.__factory = ['depFn'];

export class depClass {}
depClass.__class = ['depClass', ['state', 'a', 'b1']];

export function waitFn1() {}
export function waitFn2() {}

export function testFunc() {}
const ignore = (p) => p.catch(() => {})
testFunc.__factory = ['testFunc', depClass, [depFn, ignore], ['state', 'a', 'b']];
testFunc.__waitFor = [waitFn1, waitFn2];

export let testFuncMeta = {
    id: 'testFunc',
    handler: testFunc,
    deps: [
        {
            definition: depClass,
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
