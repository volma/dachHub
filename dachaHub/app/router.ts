import http = require('http');
import url = require('url');
import cameraOptions = require('./cameraOptions');

import camera = require('./camera');

export class Router {
    public routeRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
        let reqUrl = url.parse(req.url,true);
        if (reqUrl.path != '/favicon.ico') {
            console.info(`Processing request: ${req.url}`);
            console.info(`Route: ${JSON.stringify(reqUrl)}`);
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
                new camera.Camera().configure(<cameraOptions.CameraOptions>{ quality: reqUrl.query['quality'] });
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
    }
}