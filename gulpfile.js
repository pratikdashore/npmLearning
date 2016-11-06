var gulp = require('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');
var wiredep = require('wiredep').stream;
var browserSync = require('browser-sync');

var $p = require('gulp-load-plugins')({ lazy: true });

gulp.task('help', $p.taskListing);

gulp.task('default', ['help']);

gulp.task('vet', function() {

    log('Analyzing source with jscs and jshint');

    return gulp
        .src(config.allJs)
        .pipe($p.if(args.verbose, $p.print()))
        .pipe($p.jscs())
        .pipe($p.jshint())
        .pipe($p.jshint.reporter('jshint-stylish', { verbose: true }))
        .pipe($p.jshint.reporter('fail'));
});

gulp.task('styles', ['clean-styles'], function() {

    log('Compiling less to css');

    return gulp
        .src(config.less)
        .pipe($p.plumber())
        .pipe($p.less())
        .pipe($p.autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
        .pipe(gulp.dest(config.temp));
});

gulp.task('fonts', ['clean-fonts'], function() {
    log('Copying fonts');

    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.build + 'fonts'));
});

gulp.task('images', ['clean-images'], function() {
    log('Copying and compressing the images');

    return gulp
        .src(config.images)
        .pipe($p.imagemin({ optimizationLevel: 4 }))
        .pipe(gulp.dest(config.build + 'images'));
});

gulp.task('clean', function(done) {
    var delconfig = [].concat(config.build, config.temp);
    log('Cleaning: ' + $p.util.colors.blue(delconfig));
    return del(delconfig, done);
});

gulp.task('clean-styles', function() {
    return clean(config.temp + '**/*.css');
});

gulp.task('clean-fonts', function() {
    return clean(config.build + 'fonts/**/*.*');
});

gulp.task('clean-images', function() {
    return clean(config.build + 'images/**/*.*');
});

gulp.task('clean-code', function() {
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + '**/*.html',
        config.build + 'js/**/*.js'
    );
    return clean(files);
});

gulp.task('less-watcher', function() {

    return gulp
        .watch([config.less], ['styles']);
});

gulp.task('templatecache', ['clean-code'], function() {
    log('Creating AngularJS $templateCache');

    return gulp
        .src(config.htmltemplates)
        .pipe($p.minifyHtml({ empty: true }))
        .pipe($p.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));
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

gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function() {
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

function clean(path) {
    log('Cleaning: ' + $p.util.colors.blue(path));
    return del(path);
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