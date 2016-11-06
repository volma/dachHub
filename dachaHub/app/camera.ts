import prom = require('es6-promise');
import stream = require('stream');
import fs = require('fs');

const spawn = require('child_process').spawn;

export class Camera {

    public start(): Promise<boolean> {
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

    private getTimestamp() :string {
        let date = new Date();
        return date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds() + ': ';
    }

    private static raspistill = null;


    public launch() {
        if (!Camera.raspistill) {
            console.log(this.getTimestamp() + 'Starting...');
            Camera.raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '-', '-n', '-t', '0', '-s']);
        }
    }

    public shutdown() {
        if (!Camera.raspistill) {
            Camera.raspistill.kill();
            Camera.raspistill = null;
        }
    }

    public sendSnapshot(httpResponse: stream.Writable) {
        if (!Camera.raspistill) {
            console.log(this.getTimestamp() + 'Starting...');
            Camera.raspistill = spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '-', '-n', '-t', '0', '-s']);  
        }

        Camera.raspistill.stdout.on('data', (data) => {
            httpResponse.write(data, 'base64');
        });
        Camera.raspistill.stdout.on('close', (code) => {
            console.log(this.getTimestamp() + 'Closed...');
            httpResponse.end();
        });
        Camera.raspistill.kill('SIGUSR1');
    }
}