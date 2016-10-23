var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var gulpUtil = require('gulp-util');

gulp.task('hello-world', function() {
    console.log('hello gulp');
});






/////////////
function log(msg) {
    if (typeof msg === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                gulpUtil.log(gulpUtil.colors.blue(msg[item]));
            }
        }
    } else {
        gulpUtil.log(gulpUtil.colors.blue(msg));
    }
    if (true) { console.log('hello'); }

}