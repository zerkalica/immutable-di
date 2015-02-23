//promise-example.js
import {Builder, NativeAdapter} from 'immutable-di'
import fs from 'fs'
import Promise from 'bluebird'
Promise.promisifyAll(fs)

function Reader(name) {
    return fs.readFileAsync(name)
}
Reader.__factory = ['Reader', ['reader', 'name']]

/**
 * di auto resolves promise and return data from Reader
 */
function GetFileData(data) {
    return new Promise.resolve(data)
}
GetFileData.__factory = ['GetFileData', Reader];

const state  = {
    reader: {
        name: './test.txt'
    }
}
const ImmutableDi = Builder()
const di = ImmutableDi(new NativeAdapter(state))
di.get(GetFileData).then(data => console.log(data)) // file data
