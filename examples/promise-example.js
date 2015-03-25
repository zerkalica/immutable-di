//promise-example.js
import {ContainerCreator, NativeAdapter, Define} from '../src'
import fs from 'fs'

function Reader(name) {
    return new Promise((resolve, reject) => {
        fs.readFile(name, (err, data) => {
            return err ? reject(err) : resolve(data.toString())
        })
    })
}
Define.Factory(Reader, ['reader.name'])

/**
 * di auto resolves promise and return data from Reader
 */
function GetFileData(data) {
    return Promise.resolve(data)
}
Define.Factory(GetFileData, [Reader])

const state  = {
    reader: {
        name: './test.txt'
    }
}
const containerCreator = new ContainerCreator()
const di = containerCreator.create(new NativeAdapter(state)).get
di(GetFileData)
    .then(data => console.log(data))
    .catch(err => console.log(err.stack))
// test
