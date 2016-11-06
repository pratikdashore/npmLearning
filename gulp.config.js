module.exports = function() {

    var client = './src/client/';
    var clientApp = client + 'app/';
    var clientContent = client + 'content/';
    var clientStyles = clientContent + 'styles/';
    var temp = './.tmp/';
    var server = './src/server/';
    var root = './';
    var wiredep = require('wiredep');
    var bowerFiles = wiredep({ devDependencies: true })['js'];

    var config = {

        /**
         * file paths
         */

        temp: temp,
        root: root,
        build: './build/',
        client: client,
        server: server,
        fonts: './bower_components/font-awesome/fonts/**/*.*',
        images: clientContent + 'images/**/*.*',
        html: clientApp + '**/*.html',
        htmltemplates: clientApp + '**/*.html',
        index: client + 'index.html',

        /**
         * all js files of project to vet
         */
        allJs: [
            './src/**/*.js',
            './*.js'
        ],

        css: [
            temp + 'styles.css',
            clientStyles + '*.css',
        ],

        js: [
            clientApp + '**/*.module.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.test.js'
        ],
        less: clientStyles + 'styles.less',

        /**
         * all bower and npm paths
         */
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '../..'

        },
        packages: [
            './package.json',
            './bower.json'
        ],

        /**
         * template cache
         */
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core',
                standAlone: false,
                root: 'app/'
            }
        },
        getWiredepDefaultOptions: getWiredepDefaultOptions,

        /**
         * node options
         */
        nodeServer: server + 'app.js',
        defaultPort: 7203,

        getNodeOptions: getNodeOptions,

        /**
         * browser sync
         */
        browserReloadDelay: 1000

    };

    return config;

    function getWiredepDefaultOptions() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    }

    function getNodeOptions(isDev, port) {
        var nodeOptions = {
            script: config.nodeServer,
            delayTime: 1,
            env: {
                'PORT': port,
                'NODE_ENV': isDev ? 'dev' : 'build'
            },
            watch: [config.server]
        };

        return nodeOptions;
    }

};