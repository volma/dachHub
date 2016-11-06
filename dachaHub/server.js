"use strict";
var http = require('http');
var router = require('./app/router');
var port = process.env.port || 1337;
http.createServer(function (req, res) {
    new router.Router().routeRequest(req, res);
}).listen(port);
//# sourceMappingURL=server.js.map