//promise-example.js
import {Builder, NativeAdapter} from '../src'
import fs from 'fs'

function Reader(name) {
    return new Promise((resolve, reject) => {
        fs.readFile(name, (err, data) => {
            return err ? reject(err) : resolve(data.toString())
        })
    })
}
Reader.__factory = ['Reader', ['reader', 'name']]

/**
 * di auto resolves promise and return data from Reader
 */
function GetFileData(data) {
    return Promise.resolve(data)
}
GetFileData.__factory = ['GetFileData', Reader];

const state  = {
    reader: {
        name: './test.txt'
    }
}
const ImmutableDi = Builder()
const di = ImmutableDi(new NativeAdapter(state))
di.get(GetFileData)
    .then(data => console.log(data))
    .catch(err => console.log(err.stack))
