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
    return Camera;
}());
exports.Camera = Camera;
//# sourceMappingURL=camera-manager.js.map