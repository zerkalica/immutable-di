var gulp = require('gulp');
var babel = require('gulp-babel');
var gmocha = require('gulp-mocha');
var notifier = require('node-notifier');
var path = require('path');
var minimist = require('minimist');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
global.expect = chai.expect;
chai.use(chaiAsPromised);
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
        src: 'src',
        dest: 'dist',
        babel: {
            modules: 'common',
            loose: isDebug ? 'all' : [],
            experimental: true,
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

gulp.task('test', function(done) {
    return gulp.src(config.src + '/**/__tests__/*.js', {read: false})
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
});

gulp.task('w:code', function() {
    gulp.watch([config.src + '/**/*.js'], gulp.parallel('test'));
});

gulp.task('w', gulp.series('w:code'));

gulp.task('build', function () {
    return gulp.src(config.src + '/**/*.js')
        .pipe(babel(config.babel))
        .pipe(gulp.dest(config.dest));
});

gulp.task('default', gulp.series('build'));
