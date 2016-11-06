import http = require('http');
import url = require('url');

import camera = require('./camera');

export class Router {
    public routeRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
        console.info(`Processing request: ${req.url}`);
        let reqUrl = url.parse(req.url);
        console.info(`Route: ${JSON.stringify(reqUrl)}`);
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
    }
}