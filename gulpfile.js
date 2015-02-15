var gulp = require('gulp'),
    jest = require('jest-cli'),
    to5 = require('gulp-6to5'),
    notifier = require('node-notifier'),
    harmonize = require('harmonize');

harmonize();

var isDev = true;

var config = {
    dirs: {
        src: 'src',
        dest: 'dist'
    },
    to5: {
        modules: 'common',
        runtime: false,
        loose: isDev,
        experimental: true
    }
};


gulp.task('test', function(done) {
    jest.runCLI({}, __dirname, function(isOk, arg) {
        var message = 'Tests ' + (isOk ? 'passed' : 'failed');
        notifier.notify({title: message, message: message})
        done();
    });
});

gulp.task('tdd', ['test'], function(done) {
    gulp.watch([config.dirs.src + '/**/*.js' ], [ 'test' ]);
});

gulp.task('build', function () {
    return gulp.src(config.dirs.src + '/**/*.js')
        .pipe(to5(config.to5))
        .pipe(gulp.dest(config.dirs.dest));
});

gulp.task('default', ['build']);
