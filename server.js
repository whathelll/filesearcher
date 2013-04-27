var http = require('http');
var url = require('url');
var logger = require('./logger');

var filesearcher = require('./filesearcher');
var fs = require('fs');

function start() {
    filesearcher.setdir(__dirname + '/logfiles/');

    function onRequest(request, response) {
        var urlparts = url.parse(request.url, true);
        var pathname = urlparts.pathname;
        var query = urlparts.query;
        logger.log("Request for " + pathname+ " received.");
        logger.log("query string: " + JSON.stringify(query));

        if(pathname === "/logsearch") {
            response.writeHead(200, {"Content-Type": "text/html"});
            var rs = fs.createReadStream(__dirname + '/app/index.html');
            rs.pipe(response);
        } else if(pathname === "/logquery") {
            response.writeHead(200, {"Content-Type": "application/json"});
            filesearcher.find(query.filename, query.text, function(result){
                response.end(JSON.stringify(result));
            });
        } else if(pathname.indexOf("/logsearch/") === 0){
            console.log('file requested:' + pathname);

            var file = filesearcher.getdir() + pathname.replace("/logsearch/", "");

            filesearcher.getfile(file, response);
        } else if(pathname.indexOf('/css/') === 0 || pathname.indexOf('/js/') === 0) {
            var file = __dirname + '/app' + pathname;
            console.log('sending file:' + file);
            if(/\.(css)$/.test(pathname)) {
                response.writeHead(200, {"Content-Type": "text/css"});
            } else if(/\.(js)$/.test(pathname)){
                response.writeHead(200, {"Content-Type": "text/javascript"});
            }

            var rs = fs.createReadStream(file);
            rs.pipe(response);
        } else {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write("something");
            response.end();
        }
    }

    http.createServer(onRequest).listen(8080, "10.0.0.99");

    logger.log('Server started running at 10.0.0.99:8080/');
}

exports.start = start;