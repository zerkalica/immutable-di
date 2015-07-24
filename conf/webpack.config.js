/*eslint-env node */
/* eslint-disable no-var, no-process-env */
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var exampleDir = path.resolve(__dirname, '..', 'examples', 'flux');
var webpack = require('webpack')

const DEBUG = 'immutable-di:*'

module.exports = {
    cache: true,
    debug: true,
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, '..', 'build'),
        filename: 'app.js'
    },
    entry: path.join(exampleDir, 'index.js'),
    module: {
      loaders: [
        {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }
      ]
    },
    resolve: {
        alias: {
            'immutable-di': path.resolve(__dirname, '..', 'src')
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                IS_BROWSER: true,
                DEBUG: JSON.stringify(DEBUG)
            }
        }),
        new HtmlWebpackPlugin()
    ]
}
