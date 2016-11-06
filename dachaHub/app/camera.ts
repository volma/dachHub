import prom = require('es6-promise');
import stream = require('stream');
import fs = require('fs');
import cameraOptions = require('./cameraOptions');

const spawn = require('child_process').spawn;
const exec = require('child_process').exec;

export class Camera {

    public startStream(): Promise<boolean> {
        const raspistill = spawn('raspistill',
            ['-w', '640', '-h', '480', '-q', '5', '-o', '/tmp/stream/pic.jpg',
                '-tl', '100', '-t', '9999999', '-th', '0:0:0', '-n']);
        //raspistill -w 640 -h 480 -q 5 -o /tmp/stream/pic.jpg -tl 100 -t 9999999 -th 0:0:0 -n
        return new prom.Promise<boolean>(
            (resolve, reject) => {
                raspistill.stdout.on('data', (data) => {
                    console.log(data);
                });
                raspistill.on('close', (code) => {
                    console.log(`Raspistill process exited with code ${code}`);
                    resolve(true);
                });
                raspistill.stderr.on('data', (data) => {
                    reject(data);
                });
            }
        );
    }

    private static raspistill = null;
    
    public launch() {
        if (!Camera.raspistill) {
            Camera.startRaspistillProcess();
        }
    }

    public shutdown() {
        if (!Camera.raspistill) {
            Camera.raspistill.kill();
            Camera.raspistill = null;
        }
    }

    public configure(options: cameraOptions.CameraOptions): void {
        Camera.cameraOptions = options;
        Camera.startRaspistillProcess();
    }

    private static cameraOptions: cameraOptions.CameraOptions;

    public sendSnapshot(httpResponse: stream.Writable) {
        if (!Camera.raspistill) {
            Camera.startRaspistillProcess();
        }

        Camera.raspistill.stdout.on('data', (data) => {
            httpResponse.write(data, 'base64');
            httpResponse.end();
        });
        Camera.raspistill.stdout.on('close', (code) => {
            Camera.log('Closed...');
            httpResponse.end();
        });
        Camera.raspistill.stderr.on('data', (data) => {
            Camera.error(data);
        });

        try {
            Camera.raspistill.kill('SIGUSR1');
            //exec('sudo pkill -USR1 raspistill');
        }
        catch (Error) {
            console.log("Caught: " + Error);
            throw Error;
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

    private static startRaspistillProcess() {
        console.log(Camera.getTimestamp() + 'Starting...');
        //Camera.raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '/home/samba-share/pic%04d.jpg', '-t', '0', '-s']);  
        if (!Camera.cameraOptions) {
            Camera.raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '-', '-n', '-t', '0', '-s']);
        } else {
            Camera.raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', Camera.cameraOptions.quality, '-o', '-', '-n', '-t', '0', '-s']);
        }
    }
}