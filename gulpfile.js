var gulp = require('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');
var wiredep = require('wiredep').stream;
var browserSync = require('browser-sync');
var port = process.env.PORT || config.defaultPort;
var _ = require('lodash');
var path = require('path');

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

gulp.task('build', ['optimize', 'images', 'fonts'], function() {
    log('Building everything');

    var msg = {
        title: 'gulp build',
        subtitle: 'Deployed to the build folder',
        message: 'Running `gulp serve-build`'
    };
    del(config.temp);
    log(msg);
    notify(msg);
});

//need to create test task
gulp.task('optimize', ['inject'], function() {
    log('Optimizing the javascript, css, html');

    var assets = $p.useref({ searchPath: './' }),
        templateCache = config.temp + config.templateCache.file,
        cssFilter = $p.filter('**/*.css', { restore: true }),
        jsLibFilter = $p.filter('**/' + config.optimized.lib, { restore: true }),
        jsAppFilter = $p.filter('**/' + config.optimized.app, { restore: true }),
        notIndexFilter = $p.filter(['**/*', '!**/index.html'], { restore: true }),
        lazypipe = require('lazypipe');

    return gulp
        .src(config.index)
        .pipe($p.plumber())
        .pipe($p.inject(
            gulp.src(templateCache, { read: false }), {
                starttag: '<!-- inject:templates:js -->'
            }))
        .pipe($p.useref({ searchPath: './' }, lazypipe().pipe($p.sourcemaps.init, { loadMaps: true })))

    .pipe(cssFilter)
        .pipe($p.csso())
        .pipe(cssFilter.restore)

    .pipe(jsLibFilter)
        .pipe($p.uglify())
        .pipe(jsLibFilter.restore)

    .pipe(jsAppFilter)
        .pipe($p.ngAnnotate())
        .pipe($p.uglify())
        .pipe(jsAppFilter.restore)

    .pipe(notIndexFilter)
        .pipe($p.rev())
        .pipe(notIndexFilter.restore)

    .pipe($p.revReplace())
        .pipe($p.sourcemaps.write('.'))
        .pipe(gulp.dest(config.build))
        .pipe($p.rev.manifest())

    .pipe(gulp.dest(config.build));
});

gulp.task('serve-dev', ['inject'], function() {
    log('Setting up and running dev environment');
    serve(true);
});

gulp.task('serve-build', ['build'], function() {
    serve(false);
});

/////////////

function serve(isDev, specRunner) {
    var nodeOptions = config.getNodeOptions(isDev, port);
    return $p.nodemon(nodeOptions)
        .on('restart', function(ev) {
            log('*** nodemon restarted');
            log('files changed on restart:\n' + ev);
            setTimeout(function() {
                browserSync.notify('reloading now ...');
                browserSync.reload({ stream: false });
            }, config.browserReloadDelay);
        })
        .on('start', function() {
            log('*** nodemon started');
            startBrowserSync(isDev, specRunner);
        })
        .on('crash', function() {
            log('*** nodemon crashed: script crashed for some reason');
        })
        .on('exit', function() {
            log('*** nodemon exited cleanly');
        });
}

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function startBrowserSync(isDev, specRunner) {
    if (args.nosync || browserSync.active) {
        return;
    }

    log('Starting browser-sync on port ' + port);

    if (isDev) {
        gulp.watch([config.less], ['styles'])
            .on('change', changeEvent);
    } else {
        gulp.watch([config.less, config.clientCss, config.js, config.html], ['optimize', browserSync.reload])
            .on('change', changeEvent);
    }

    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [
            config.client + '**/*.*',
            '!' + config.less,
            config.temp + '**/*.css'
        ] : [],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 0 //1000
    };

    if (specRunner) {
        options.startPath = config.specRunnerFile;
    }

    browserSync(options);
}

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

function notify(options) {
    var notifier = require('node-notifier');
    var notifyOptions = {
        sound: 'Bottle',
        contentImage: path.join(__dirname, 'gulp.png'),
        icon: path.join(__dirname, 'gulp.png')
    };
    _.assign(notifyOptions, options);
    notifier.notify(notifyOptions);
}