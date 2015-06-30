import glob from 'glob'
const srcMask = __dirname + '/src/**/__tests__/*.js'

glob.sync(srcMask).forEach(file => require(file))
