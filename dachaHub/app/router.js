"use strict";
var url = require('url');
var camera = require('./camera');
var Router = (function () {
    function Router() {
    }
    Router.prototype.routeRequest = function (req, res) {
        console.info("Processing request: " + req.url);
        var reqUrl = url.parse(req.url);
        console.info("Route: " + JSON.stringify(reqUrl));
        switch (reqUrl.path) {
            case '/start':
                new camera.Camera().launch();
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('OK');
                break;
            case '/stop':
                new camera.Camera().shutdown();
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('OK');
                break;
            case '/pic.jpg':
                new camera.Camera()
                    .sendSnapshot(res);
                break;
        }
    };
    return Router;
}());
exports.Router = Router;
//# sourceMappingURL=router.js.map