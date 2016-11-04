var gulp = require('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');
var wiredep = require('wiredep').stream;
var browserSync = require('browser-sync');

var $p = require('gulp-load-plugins')({ lazy: true });

// var jscs = require('gulp-jscs');
// var gulpUtil = require('gulp-util');
// var jshint = require('gulp-jshint');
// var gulpif = require('gulp-if');
// var gulpPrint = require('gulp-print');

gulp.task('hello-world', function() {
    log('hello gulp');
});

gulp.task('vet', function() {

    log('Analyzing source with jscs and jshint');

    return gulp.src(config.allJs)
        .pipe($p.if(args.verbose, $p.print()))
        .pipe($p.jscs())
        .pipe($p.jshint())
        .pipe($p.jshint.reporter('jshint-stylish', { verbose: true }))
        .pipe($p.jshint.reporter('fail'));
});

gulp.task('styles', ['clean-styles'], function(done) {

    log('Compiling less to css');

    return gulp
        .src(config.less)
        .pipe($p.plumber())
        .pipe($p.less())
        .pipe($p.autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
        .pipe(gulp.dest(config.temp));
});

gulp.task('clean-styles', function(done) {

    log('cleaning up all css files from .tmp');

    var files = config.temp + '**/*.css';
    clean(files, done);
});

gulp.task('less-watcher', function() {

    return gulp
        .watch([config.less], ['styles']);
});

gulp.task('wiredep', function() {
    log('wire up the bower js css and app js into index html');
    var options = config.getWiredepDefaultOptions();
    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe($p.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.client));
});

gulp.task('inject', ['wiredep', 'styles'], function() {
    log('Wire up the app css into html and call wiredep');
    return gulp
        .src(config.index)
        .pipe($p.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.client));
});

gulp.task('serve-dev', ['inject'], function() {
    log('Setting up and running dev environment');
    var nodeOptions = config.getNodeOptions();
    return $p.nodemon(nodeOptions);
});

/////////////

function clean(path, done) {
    log('cleaning ' + $p.util.colors.blue(path));
    del(path, done);
}

function log(msg) {
    if (typeof msg === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $p.util.log($p.util.colors.blue(msg[item]));
            }
        }
    } else {
        $p.util.log($p.util.colors.blue(msg));
    }
}