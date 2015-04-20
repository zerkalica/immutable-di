#!/bin/sh

npm i --save-dev babel-core eslint babel-eslint \
    chai chai-as-promised mocha sinon sinon-chai proxyquire \
    minimist lodash node-notifier \
    webpack babel-loader html-webpack-plugin react isomorphic-fetch \
    "git+https://github.com/gulpjs/gulp.git#4.0" gulp-babel gulp-mocha gulp-util del

npm i --save debug
