module.exports = function() {

    var client = './src/client/';
    var clientApp = client + 'app/';
    var clientContent = client + 'content/';
    var clientStyles = clientContent + 'styles/';
    var temp = './.tmp/';
    var config = {

        //temp files folder

        temp: temp,

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