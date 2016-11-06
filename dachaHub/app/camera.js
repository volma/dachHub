"use strict";
var prom = require('es6-promise');
var spawn = require('child_process').spawn;
var Camera = (function () {
    function Camera() {
    }
    Camera.prototype.start = function () {
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
    Camera.prototype.getTimestamp = function () {
        var date = new Date();
        return date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds() + ': ';
    };
    Camera.prototype.launch = function () {
        if (!Camera.raspistill) {
            console.log(this.getTimestamp() + 'Starting...');
            Camera.raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '-', '-n', '-t', '0', '-s']);
        }
    };
    Camera.prototype.shutdown = function () {
        if (!Camera.raspistill) {
            Camera.raspistill.kill();
            Camera.raspistill = null;
        }
    };
    Camera.prototype.sendSnapshot = function (httpResponse) {
        var _this = this;
        if (!Camera.raspistill) {
            console.log(this.getTimestamp() + 'Starting...');
            Camera.raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '-', '-n', '-t', '0', '-s']);
        }
        Camera.raspistill.stdout.on('data', function (data) {
            httpResponse.write(data, 'base64');
        });
        Camera.raspistill.stdout.on('close', function (code) {
            console.log(_this.getTimestamp() + 'Closed...');
            httpResponse.end();
        });
        Camera.raspistill.kill('SIGUSR1');
    };
    Camera.raspistill = null;
    return Camera;
}());
exports.Camera = Camera;
//# sourceMappingURL=camera.js.map