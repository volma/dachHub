import http = require('http');
import router = require('./app/router');

var port = process.env.port || 1337

http.createServer(function (req, res) {   
    new router.Router().routeRequest(req, res);
}).listen(port);