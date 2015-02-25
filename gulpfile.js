var gulp = require('gulp');
var babel = require('gulp-babel');
var gmocha = require('gulp-mocha');
var notifier = require('node-notifier');
var path = require('path');
var minimist = require('minimist');

var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');

global.expect = chai.expect;
global.sinon = sinon;
global.spy = sinon.spy;
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

var knownOptions = {
  string: 'env',
  boolean: 'debug',
  default: {
    env: process.env.NODE_ENV || 'production',
    debug: false
  }
};

function getConfig(args) {
    var options = minimist(args, knownOptions);
    var env = options.env;
    var isDebug = env === 'dev' ? true : options.debug;

    return {
        src: {
            scripts: 'src/**/*.js',
            tests: 'src/**/__tests__/*.js'
        },
        dest: {
            scripts: 'dist',
            tests: 'dist/**/__tests__/*.js'
        },
        babel: {
            modules: 'common',
            loose: isDebug ? 'all' : [],
            experimental: true,
            externalHelpers: false,
            playground: true
        },
        mocha: {
            reporter: 'spec'
        },
        notify: {
            iconPath: path.join(path.dirname(require.resolve('mocha')), 'images'),
            time: 500,
        }
    }
};

var config = getConfig(process.argv.slice(2));

require('babel-core/register')(config.babel);
require('babel-core/polyfill');

function runTest(src) {
    return gulp.src(src, {read: false})
        .pipe(gmocha(config.mocha))
        .on('error', function (arg) {
            console.warn(arg.message);
            notifier.notify({
                title: 'Test',
                message: arg.message,
                time: config.notify.time,
                icon: config.notify.iconPath + '/error.png'
            });
        });
}

gulp.task('test:src', function(done) {
    return runTest(config.src.tests);
});

gulp.task('test:dist', function(done) {
    return runTest(config.dest.tests);
});

gulp.task('w:code', function() {
    gulp.watch([config.src.scripts], gulp.series('test:src'));
});

gulp.task('w', gulp.series('w:code'));

gulp.task('build', function () {
    return gulp.src(config.src.scripts)
        .pipe(babel(config.babel))
        .pipe(gulp.dest(config.dest.scripts));
});

gulp.task('test', gulp.series('build', 'test:dist'));

gulp.task('default', gulp.series('build'));
