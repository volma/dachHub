"use strict";
var prom = require('es6-promise');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var Camera = (function () {
    function Camera() {
    }
    Camera.prototype.startStream = function () {
        var raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '/tmp/stream/pic.jpg',
            '-tl', '100', '-t', '9999999', '-th', '0:0:0', '-n']);
        //raspistill -w 640 -h 480 -q 5 -o /tmp/stream/pic.jpg -tl 100 -t 9999999 -th 0:0:0 -n
        return new prom.Promise(function (resolve, reject) {
            raspistill.stdout.on('data', function (data) {
                console.log(data);
            });
            raspistill.on('close', function (code) {
                console.log("Raspistill process exited with code " + code);
                resolve(true);
            });
            raspistill.stderr.on('data', function (data) {
                reject(data);
            });
        });
    };
    Camera.prototype.launch = function () {
        if (!Camera.raspistill) {
            Camera.startRaspistillProcess();
        }
    };
    Camera.prototype.shutdown = function () {
        if (!Camera.raspistill) {
            Camera.raspistill.kill();
            Camera.raspistill = null;
        }
    };
    Camera.prototype.configure = function (options) {
        Camera.cameraOptions = options;
        Camera.startRaspistillProcess();
    };
    Camera.prototype.sendSnapshot = function (httpResponse) {
        if (!Camera.raspistill) {
            Camera.startRaspistillProcess();
        }
        Camera.raspistill.stdout.on('data', function (data) {
            httpResponse.write(data, 'base64');
            httpResponse.end();
        });
        Camera.raspistill.stdout.on('close', function (code) {
            Camera.log('Closed...');
            httpResponse.end();
        });
        Camera.raspistill.stderr.on('data', function (data) {
            Camera.error(data);
        });
        try {
            Camera.raspistill.kill('SIGUSR1');
        }
        catch (Error) {
            console.log("Caught: " + Error);
            throw Error;
        }
    };
    Camera.log = function (message) {
        console.log(Camera.getTimestamp() + ' ' + message);
    };
    Camera.error = function (message) {
        console.error(Camera.getTimestamp() + ' ' + message);
    };
    Camera.getTimestamp = function () {
        var date = new Date();
        return date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds() + ': ';
    };
    Camera.startRaspistillProcess = function () {
        console.log(Camera.getTimestamp() + 'Starting...');
        //Camera.raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '/home/samba-share/pic%04d.jpg', '-t', '0', '-s']);  
        if (!Camera.cameraOptions) {
            Camera.raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '-', '-n', '-t', '0', '-s']);
        }
        else {
            Camera.raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', Camera.cameraOptions.quality, '-o', '-', '-n', '-t', '0', '-s']);
        }
    };
    Camera.raspistill = null;
    return Camera;
}());
exports.Camera = Camera;
//# sourceMappingURL=camera.js.map