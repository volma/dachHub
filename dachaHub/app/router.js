"use strict";
var url = require('url');
var camera = require('./camera');
var Router = (function () {
    function Router() {
    }
    Router.prototype.routeRequest = function (req, res) {
        var reqUrl = url.parse(req.url, true);
        if (reqUrl.path != '/favicon.ico') {
            console.info("Processing request: " + req.url);
            console.info("Route: " + JSON.stringify(reqUrl));
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE');
        res.setHeader('Access-Control-Allow-Headers', '*');
        switch (reqUrl.pathname) {
            case '/start':
                new camera.Camera().launch();
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('OK');
                break;
            case '/config':
                new camera.Camera().configure({ quality: reqUrl.query['quality'] });
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('OK');
                break;
            case '/stop':
                new camera.Camera().shutdown();
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('OK');
                break;
            case '/pic.jpg':
                new camera.Camera().sendSnapshot(res);
                break;
        }
    };
    return Router;
}());
exports.Router = Router;
//# sourceMappingURL=router.js.map