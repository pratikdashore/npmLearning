(function() {
    'use strict';

    angular
        .module('npmLearning', []);

    var list = document.getElementsByTagName('section'),
        nameKeys = [],
        counter = 0,
        folderCounter = 0,
        titleList = [],
        startTime = Date.now(),
        folderFiles = [],
        folders = [];

    for (var i = 0; i < list.length; i++) {
        if (list[i].className.match(/\bmodule\b/)) {
            var headerText = list[i].getElementsByTagName('h2')[0].innerText;
            var ul = list[i].getElementsByClassName('clips');
            var liList = ul[0].getElementsByClassName('title');
            if (liList.length > 1) {
                //console.log('mkdir '+'"'+(i+1)+'.'+headerText+'"');
                console.log('------' + headerText + '------');
                folderCounter += 1;
                var folder = folderCounter + '. ' + headerText;
                for (var y = 0; y < liList.length; y++) {
                    counter += 1;
                    var file = counter + '. ' + liList[y].innerText;
                    var ltm = {
                        folderName: folder,
                        fileName: file
                    };

                    console.log(counter + ' - ' + liList[y].innerText);

                    folderFiles.push(ltm);
                    titleList.push(liList[y]);
                }
                folders.push(folder);
                console.log('');
                console.log('');
            }
        }
    }

    var radn = [];

    for (var k = 0; k < titleList.length; k++) {
        radn.push(Math.floor((Math.random() * (100000 - 30000)) + 30000));
    }

    radn.sort(function(a, b) { return a - b; });

    function downloadVideo(uri, name) {
        var link = document.createElement('a');
        link.setAttribute('download', name);
        link.href = uri;
        var names = {};
        var myRegexp = /(\d+\.mp4)/g;
        var match = myRegexp.exec(uri);
        names.key = match[1];
        names.value = name;
        nameKeys.push(names);
        var endTime = Date.now();
        var hitTime = (endTime - startTime) / 1000;
        console.log('Hitted ' + name + ' After ' + hitTime + ' secs');
        startTime = Date.now();
        link.click();
    }

    if (titleList.length > 0) {
        titleList.forEach(function(item, idx) {
            setTimeout(function() {
                item.click();
                setTimeout(function() {
                    downloadVideo(document.getElementsByTagName('video')[0].src, item.innerText);
                }, 1000);

            }, (radn[idx]) * idx);
        });
    }

    nameKeys.forEach(function(item, idx) {
        var counter = idx + 1;
        console.log('ren ' + '"' + item.key + '"' + ' ' + '"' + counter + '. ' + item.value + '.mp4' + '"' + ';');
    });

    folders.forEach(function(item) {
        console.log('mkdir ' + '"' + item + '"');
    });

    folderFiles.forEach(function(item) {
        var msg = 'move ' + '"' + item.fileName + '.mp4"' + ' "' + item.folderName + '/' +
            item.fileName + '.mp4"' + ';';
        console.log(msg);
    });

    //file rename for already existing code
    folderFiles.forEach(function(item, idx) {
        var is = item.fileName.indexOf('.');
        var sFile = idx + item.fileName.substring(is);
        var msg = 'move ' + '"' + sFile + '.mp4"' + ' "' + item.folderName + '/' + item.fileName + '.mp4"' + ';';
        console.log(msg);
    });

    //already once
    // cmd : dir /b /a-d >> output.txt
    var arr = [];
    var sFl = [];
    var filteredList = arr.map(function(item) { return item.trim(); });
    var folderList = filteredList.filter(function(item, idx) {
        if (item.indexOf('----') > -1) {
            return true;
        }
    }).map(function(item, idx) {
        return (idx + 1) + '. ' + item.replace(new RegExp('-', 'g'), '').trim();
    });

    var folderName, ctr = 0;
    var dFiles = filteredList.filter(function(item, idx) {
        if (item.length > 1) {
            return true;
        }
    }).map(function(item) {
        var local = {};
        if (item.indexOf('----') > -1) {
            ctr += 1;
            folderName = ctr + '. ' + item.replace(new RegExp('-', 'g'), '').trim();
        } else {
            local.folderName = folderName;
            local.fileName = item.replace(new RegExp(' - ', 'g'), '. ').trim();
        }
        return local;
    }).filter(function(item) {
        return !!item.fileName;
    });

    var sFiles = sFl.map(function(item) {
        return item.trim();
    }).sort(function(a, b) {
        return a - b;
    });

    folderList.forEach(function(item) {
        console.log('mkdir ' + '"' + item + '"');
    });

    for (var m = 0; m < dFiles.length; m++) {
        var msg = 'ren ' + '"' + sFiles[m] + '" ' + '"' + dFiles[m].fileName + '.mp4"';
        console.log(msg);
    }

    dFiles.forEach(function(item, idx) {
        var is = item.fileName.indexOf('.');
        var sFile = (idx + 1) + item.fileName.substring(is);
        var msg = 'move ' + '"' + sFile + '.mp4"' + ' "' + item.folderName + '/' + item.fileName + '.mp4"' + ';';
        console.log(msg);
    });

}());