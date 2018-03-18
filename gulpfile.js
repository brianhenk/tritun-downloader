let gulp = require('gulp'),
    zip = require('gulp-zip'),
    connect = require('gulp-connect');

gulp.task('default', ['build-zip']);

gulp.task('build-zip', function () {
    gulp.src(['add-on/**'])
        .pipe(zip("triton-downloader.zip"))
        .pipe(gulp.dest('dist'));
});

gulp.task('test-server', function() {
    connect.server({ root: "test-site", port: 12800, https: true });
});