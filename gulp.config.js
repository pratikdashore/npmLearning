module.exports = function() {

    var client = './src/client/';
    var clientApp = client + 'app/';
    var clientContent = client + 'content/';
    var clientStyles = clientContent + 'styles/';
    var temp = './.tmp/';
    var config = {

        //temp files folder

        temp: temp,
        build: './build/',
        fonts: './bower_components/font-awesome/fonts/**/*.*',
        images: clientContent + 'images/**/*.*',
        htmltemplates: clientApp + '**/*.html',

        // all js files of project to vet
        allJs: [
            './src/**/*.js',
            './*.js'
        ],
        client: client,
        css: [
            temp + 'styles.css',
            clientStyles + '*.css',
        ],
        index: client + 'index.html',
        js: [
            clientApp + '**/*.module.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.test.js'
        ],
        less: clientStyles + 'styles.less',

        //all bower and npm paths
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '../..'

        },

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
        getNodeOptions: getNodeOptions

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

    function getNodeOptions() {
        var nodeOptions = {

        };

        return nodeOptions;
    }

};