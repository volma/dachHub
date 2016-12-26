"use strict";
var os = require('child_process');
//import * as psTree from 'ps-tree';
var psTree = require('ps-tree');
var Camera = (function () {
    function Camera() {
    }
    Camera.prototype.shutdown = function () {
        if (Camera.raspistill) {
            Camera.raspistill.removeAllListeners('close');
            Camera.raspistill.stdout.removeAllListeners('data');
            Camera.raspistill.stderr.removeAllListeners('data');
            Camera.log("Killing process: " + Camera.raspistill.pid);
            this.killProcess(Camera.raspistill.pid);
            Camera.raspistill = null;
        }
    };
    Camera.prototype.configure = function (options) {
        this.shutdown();
        Camera.cameraOptions = options;
        Camera.startRaspistillProcess();
    };
    Camera.prototype.test = function (httpResponse) {
        if (!Camera.raspistill) {
            Camera.startRaspistillProcess();
        }
        var dataListener = function (data) {
            var tryArr = data;
            if (tryArr) {
                console.log(tryArr.length);
                if (tryArr.length > 0) {
                    console.log(tryArr[tryArr.length - 1]);
                    console.log(tryArr[tryArr.length - 2]);
                }
            }
            httpResponse.write(data, 'base64');
            //httpResponse.end();
            Camera.log("Sent out image. Listeners: " + Camera.raspistill.stdout.listeners.length);
            //Camera.raspistill.stdout.removeListener('data', dataListener);
        };
        Camera.raspistill.stdout.on('data', dataListener);
        try {
            Camera.raspistill.kill('SIGUSR1');
        }
        catch (Error) {
            console.log("Caught: " + Error);
            throw Error;
        }
    };
    Camera.startRaspistillProcess = function () {
        console.log(Camera.getTimestamp() + 'Starting...');
        //Camera.raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '/home/samba-share/pic%04d.jpg', '-t', '0', '-s']);  
        if (!Camera.cameraOptions) {
            Camera.raspistill = os.spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '-', '-n', '-t', '0', '-s']);
        }
        else {
            Camera.raspistill = os.spawn('raspistill', [
                '-w', Camera.cameraOptions.width.toString(),
                '-h', Camera.cameraOptions.height.toString(),
                '-q', Camera.cameraOptions.quality.toString(),
                '-o', '-',
                '-n',
                '-t', '0',
                '-th', 'none',
                '-s']);
        }
        Camera.raspistill
            .on('close', function (code) {
            Camera.log('Closed...');
        });
        Camera.raspistill.stderr
            .on('data', function (e) {
            Camera.error(e);
        });
    };
    Camera.prototype.sendSnapshot = function (httpResponse) {
        if (!Camera.raspistill) {
            Camera.startRaspistillProcess();
        }
        var dataListener = function (data) {
            httpResponse.write(data, 'base64');
            var tryArr = data;
            if (tryArr) {
                console.log('Sent out chunk, length = ' + tryArr.length);
                if (tryArr.length < 2 || (tryArr[tryArr.length - 1] == 217 && tryArr[tryArr.length - 2] == 255)) {
                    //End of file
                    httpResponse.end();
                    Camera.raspistill.stdout.removeListener('data', dataListener);
                }
            }
        };
        Camera.raspistill.stdout.on('data', dataListener);
        Camera.log("Sent out image. Listeners: " + Camera.raspistill.stdout.listeners.length);
        try {
            Camera.raspistill.kill('SIGUSR1');
        }
        catch (Error) {
            console.log("Caught: " + Error);
            throw Error;
        }
    };
    Camera.prototype.killProcess = function (pid, signal, callback) {
        signal = signal || 'SIGKILL';
        callback = callback || function () { };
        var killTree = true;
        if (killTree) {
            psTree(pid, function (err, children) {
                [pid].concat(children.map(function (p) {
                    return p.PID;
                })).forEach(function (tpid) {
                    try {
                        process.kill(tpid, signal);
                    }
                    catch (ex) { }
                });
                callback();
            });
        }
        else {
            try {
                process.kill(pid, signal);
            }
            catch (ex) { }
            callback();
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
    Camera.raspistill = null;
    return Camera;
}());
exports.Camera = Camera;
//# sourceMappingURL=camera.js.map