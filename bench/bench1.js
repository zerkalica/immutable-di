/* eslint-env node */
import Container from '../src/container'
import NativeCursor from '../src/cursors/native'
import {Factory, Setter} from '../src/define'
import {Suite} from 'benchmark'

const cursor = new NativeCursor({
    a: {
        b: {
            d: 'test1',
            c: {
                k: 'test3',
                e: 'test2'
            }
        }
    }
})
const A = Factory([['a', 'b']])(v => v)
const B = Factory([['a', 'b', 'c', 'e']])(v => v)
const D = Factory([['a', 'b', 'd'], A, B, ['a', 'b', 'c', 'k']])((p, a, b, k) => ({p, a, b, k}))

function imdiGetSetTest(container) {
    const get = container.get
    const set1 = get(Setter(['a', 'b', 'c', 'e']))
    const set2 = get(Setter(['a', 'b', 'd']))
    const set3 = get(Setter(['a', 'b', 'c', 'k']))

    return function _imdiGetSetTest() {
        set1('test.abce.' + Math.random())
        set3('test.abck.' + Math.random())
        set2('test.abd.' + Math.random()).commit()
        get(D)
    }
}

const container = new Container(cursor)

const suite = new Suite()

suite
    .add('container#get/set', imdiGetSetTest(container))
    .on('cycle', event => {
        console.log(event.target.toString())
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').pluck('name'))
    })
    .run({
        async: true
    })
