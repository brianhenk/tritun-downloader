let gulp = require('gulp'),
    zip = require('gulp-zip'),
    connect = require('gulp-connect');

function buildZip(cb) {
    return gulp.src(['add-on/**'])
        .pipe(zip("triton-downloader.zip"))
        .pipe(gulp.dest('dist'));
}

function testServer(cb) {
    connect.server({ root: "test-site", port: 12800, https: true });
    cb();
}

exports.default = gulp.series(buildZip);
exports.testServer = gulp.series(testServer);
