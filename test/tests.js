import glob from 'glob'
import 'source-map-support/register'

const mask = 'src/**/__tests__/*.js'
const srcMask = __dirname + '/../' + mask
//console.log(srcMask)
glob.sync(srcMask).forEach(file => require(file))
