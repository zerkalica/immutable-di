var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var exampleDir = path.join(__dirname, 'examples', 'flux');
module.exports = {
    cache: true,
    debug: true,
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'app.js'
    },
    entry: path.join(exampleDir, 'index.js'),
    module: {
      loaders: [
        { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader?stage=0'}
      ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(exampleDir, 'index.tpl.html')
        })
    ]
}