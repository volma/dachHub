import prom = require('es6-promise');
import stream = require('stream');
import fs = require('fs');
import cameraOptions = require('./cameraOptions');
import * as os from 'child_process';
//import * as psTree from 'ps-tree';
let psTree = require('ps-tree');

export class Camera {
    
    private static raspistill: os.ChildProcess = null;
    private static cameraOptions: cameraOptions.CameraOptions;
    
    public shutdown() {
        if (Camera.raspistill) {
            Camera.raspistill.removeAllListeners('close');
            Camera.raspistill.stdout.removeAllListeners('data');
            Camera.raspistill.stderr.removeAllListeners('data');
            Camera.log("Killing process: " + Camera.raspistill.pid);
            this.killProcess(Camera.raspistill.pid);
            Camera.raspistill = null;
        }
    }
    
    public configure(options: cameraOptions.CameraOptions): void {
        this.shutdown();
        Camera.cameraOptions = options;
        Camera.startRaspistillProcess();
    }
        
    private static startRaspistillProcess() {
        console.log(Camera.getTimestamp() + 'Starting...');
        //Camera.raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '/home/samba-share/pic%04d.jpg', '-t', '0', '-s']);  
        if (!Camera.cameraOptions) {
            Camera.raspistill = os.spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '-', '-n', '-t', '0', '-s']);
        } else {
            Camera.raspistill = os.spawn('raspistill', [
                '-w', Camera.cameraOptions.width.toString(),
                '-h', Camera.cameraOptions.height.toString(),
                '-q', Camera.cameraOptions.quality.toString(),
                '-o', '-',
                '-n',
                '-t', '0',
                '-s']);
        }
    }

    public sendSnapshot(httpResponse: stream.Writable) {
        if (!Camera.raspistill) {
            Camera.startRaspistillProcess();
            Camera.raspistill
                .on('close', (code) => {
                    Camera.log('Closed...');
                });
            Camera.raspistill.stderr
                .on('data', (e) => {
                    Camera.error(e);
                });
        }

        let dataListener = (data: any) => {
            httpResponse.write(data, 'base64');
            httpResponse.end();
            Camera.log("Sent out image. Listeners: " + Camera.raspistill.stdout.listeners.length);
            Camera.raspistill.stdout.removeListener('data', dataListener);
        };

        Camera.raspistill.stdout.on('data', dataListener);

        try {
            Camera.raspistill.kill('SIGUSR1');
            //exec('sudo pkill -USR1 raspistill');
        }
        catch (Error) {
            console.log("Caught: " + Error);
            throw Error;
        }
    }

    private killProcess(pid: any, signal?: string, callback?: () => void) {
        signal = signal || 'SIGKILL';
        callback = callback || function () { };
        var killTree = true;
        if (killTree) {
            psTree(pid, function (err, children) {
                [pid].concat(
                    children.map(function (p) {
                        return p.PID;
                    })
                ).forEach(function (tpid) {
                    try { process.kill(tpid, signal) }
                    catch (ex) { }
                });
                callback();
            });
        } else {
            try { process.kill(pid, signal) }
            catch (ex) { }
            callback();
        }
    }

    private static log(message: string): void {
        console.log(Camera.getTimestamp() + ' ' + message);
    }

    private static error(message: string): void {
        console.error(Camera.getTimestamp() + ' ' + message);
    }

    private static getTimestamp(): string {
        let date = new Date();
        return date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds() + ': ';
    }
}