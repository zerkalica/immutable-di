require('babel-core/register');

var gulp = require('gulp');
var babel = require('gulp-babel');
var gmocha = require('gulp-mocha');
var notifier = require('node-notifier');
var path = require('path');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

var iconPath = path.join(path.dirname(require.resolve('mocha')), 'images')

var isDev = true;
var config = {
    dirs: {
        src: 'src',
        dest: 'dist'
    },
    babel: {
        modules: 'common',
        runtime: false,
        loose: !isDev,
        experimental: true
    },
    mocha: {
        reporter: 'spec'
    }
};


gulp.task('test', function(done) {
    return gulp.src(config.dirs.src + '/**/__tests__/*.js', {read: false})
        .pipe(gmocha(config.mocha))
        .on('error', function (arg) {
            notifier.notify({
                title: 'Test',
                message: arg.message,
                time: 500,
                icon: iconPath + '/error.png'
            });
        });
});

gulp.task('w:code', function() {
    gulp.watch([config.dirs.src + '/**/*.js'], gulp.parallel('test'));
});

gulp.task('w', gulp.series('test', 'w:code'));

gulp.task('build', function () {
    return gulp.src(config.dirs.src + '/**/*.js')
        .pipe(babel(config.babel))
        .pipe(gulp.dest(config.dirs.dest));
});

gulp.task('default', gulp.series('build'));
