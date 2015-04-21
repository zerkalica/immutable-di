var gulp = require('gulp');
var babel = require('gulp-babel');
var gmocha = require('gulp-mocha');
var notifier = require('node-notifier');
var path = require('path');
var minimist = require('minimist');
var del = require('del');
var gutil = require('gulp-util');

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
            optional: ['runtime'],
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

function clean(out) {
    return function doClean(done) {
        del(out, function(err, deletedFiles) {
            if (err) {
                throw new gutil.PluginError('clean', err);
            }
            gutil.log('[clean]', deletedFiles.join(', ').toString({
                colors: true,
                version: false,
                hash: false,
                timings: false,
                chunks: false,
                chunkModules: false
            }));
            done();
        });
    }
}

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

gulp.task('test-src', function(done) {
    return runTest(config.src.tests);
});

gulp.task('test-dist', function(done) {
    return runTest(config.dest.tests);
});

gulp.task('dev-test', function() {
    gulp.watch([config.src.scripts], gulp.series('test-src'));
});


gulp.task('build:dist', function () {
    return gulp.src(config.src.scripts)
        .pipe(babel(config.babel))
        .pipe(gulp.dest(config.dest.scripts));
});

gulp.task('test', gulp.series('test-src'));

gulp.task('clean', clean(config.dest.scripts));

gulp.task('build', gulp.series('clean', 'build:dist', 'test-dist'));

gulp.task('default', gulp.series('build'));
