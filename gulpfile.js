var gulp = require('gulp');
var babel = require('gulp-babel');
var gmocha = require('gulp-mocha');
var notifier = require('node-notifier');
var path = require('path');
var minimist = require('minimist');

var knownOptions = {
  string: ['env', 'tests'],
  boolean: 'debug',
  default: {
    env: process.env.NODE_ENV || 'production',
    debug: false,
    tests: '**/__tests__/*.js'
  }
};

function getConfig(args) {
    var options = minimist(args, knownOptions);
    var env = options.env;
    var isDebug = env === 'dev' ? true : options.debug;

    return {
        src: {
            scripts: 'src/**/*.js',
            tests: 'src/' + options.tests
        },
        dest: {
            scripts: 'dist',
            tests: 'dist/' + options.tests
        },
        babel: {
            modules: 'common',
            loose: isDebug ? 'all' : [],
            externalHelpers: false,
            stage: 0
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
            console.warn(arg.message, arg.stack);
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

gulp.task('build:dist', function () {
    return gulp.src(config.src.scripts)
        .pipe(babel(config.babel))
        .pipe(gulp.dest(config.dest.scripts));
});

gulp.task('test', gulp.series('test:src'));

gulp.task('build', gulp.series('build:dist', 'test:dist'));

gulp.task('default', gulp.series('build'));
