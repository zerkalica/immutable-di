require('babel-core/register')({
    experimental: true,
    externalHelpers: true,
    playground: true
});
require('babel-core/external-helpers');

var script = process.argv[2];

if (!script) {
    throw new Error('usage: examplescript.js');
}

require('./' + script);
