var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var filesearcher = function() {
    var option = {
        "dir": __dirname,
        "timeout": 10000,
        "filepattern":  ""
    };

    this.setdir = function(newdir) {
        option.dir = newdir;
    }
    this.getdir = function() {
        return option.dir;
    }
    this.setfilepattern = function(pattern) {
        option.filepattern = pattern;
    }

    var filterbypattern = function(partname, files) {
        if(!partname) partname= "";
        for(var i = files.length-1; i >= 0; i--) {
            if(!files[i].match(option.filepattern) || !files[i].match(partname)) {
                files.splice(i, 1);
            }
        }
        console.log('files after filtered out: ' + files);
        return files;
    }

    var grepforcontent = function(searchtext, callback) {
        console.log('greping for: ' + searchtext);
        exec('grep -l ' + searchtext + ' ' + option.dir + '*', {timeout: option.timeout}, function(err, stdout, stdin) {
            if(err) {
                console.log('error in grep: ' + err);
                callback([]);
            } else {
                var results = stdout.split('\n');
                results.pop(); //remove last one which is empty line

                for(var i = 0; i < results.length; i++) {
                    var file = results[i].split('/');
                    results[i] = file.pop();
                }
                console.log(results);
                callback(results);
            }
        });
    }

    var findfilesinpath = function(partname, searchtext, callback) {
        console.log('starting search with partname:"' + partname + '" searchtext: ' + searchtext);

        fs.readdir(option.dir, function(err, files) {
            if(err) {
                console.log('error encountered reading dir: ' + err);
                callback(null);
            } else {
                console.log('files found:' + files);
                files = filterbypattern(partname, files);
                callback(files);
            }
        });
    }

    var getfileinfos = function(files, callback) {
        var fileinfos = [];
        if(!files || files.length === 0) {
            callback(fileinfos)
        };
        files.forEach(function(file) {
            fs.stat(option.dir + file, function(err, stat) {
                if(stat && stat.isFile()) {
                    //console.log('file stat:' + JSON.stringify(stat));
                    fileinfos.push({
                        "filename": file,
                        "mtime": stat.mtime,
                        "size": stat.size
                    });

                    //console.log('checking fileinfos length:' + fileinfos.length);
                    if(fileinfos.length === files.length) {
                        //console.log('returning fileinfos:' + JSON.stringify(fileinfos));
                        callback(fileinfos);
                    }
                }
            });

        });
    }

    this.find = function(partname, searchtext, callback) {
        console.log('looking in: ' + option.dir);

        fs.exists(option.dir, function(exists) {
            if(exists) {

                if(searchtext && searchtext.length > 0) {
                    grepforcontent(searchtext, function(files) {
                        files = filterbypattern(partname, files);
                        getfileinfos(files, function(files){
                            callback({"errors":null, "listoffiles":files});
                        });

                    });
                } else {
                    findfilesinpath(partname, searchtext, function(files) {
                        getfileinfos(files, function(files){
                            callback({"errors":null, "listoffiles":files});
                        });
                    });
                }
            } else {
                console.log('path does not exist:' + option.dir);
                callback({"errors":'path does not exist', "listoffiles":null});
            }
        });
    }

    this.getfile = function(file, response) {
        fs.exists(file, function(exists) {
            if(exists) {
                response.writeHead(200, {"Content-Type": "text/plain"});
                var rs = fs.createReadStream(file);
                rs.pipe(response);

            } else {
                response.writeHead(200, {"Content-Type": "text/html"});
                response.end("file not found");
            }
        });
    }
}



module.exports = new filesearcher();