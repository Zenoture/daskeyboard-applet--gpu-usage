// Library to track gpuUsage
const parse = require('csv-parse/lib/sync'); 
const exec = require('child_process').exec;

// Library to send signal to Q keyboards
const q = require('daskeyboard-applet');

// Color associated to gpu activity from low (green), middle (yellow), to high (red).
const colors = ['#00FF00', '#33FF00','#FFFF00', '#FF6600', '#FF0000'];

const logger = q.logger;


class GPUUsage extends q.DesktopApp {
    constructor() {
        super();
        this.pollingInterval = 3000; // run every 3 seconds
    }

    // call this function every pollingInterval
    async run() {
        return this.getGPUUsage().then(percent => {
            // return signal every 3000ms

            // percent equals to -1 means NVIDIA compatibility error
            if(percent!=-1){
                return new q.Signal({
                    points: [this.generateColor(percent)],
                    name: "GPU Usage",
                    message: "GPU Memory used: " + Math.round(percent) + "%",
                    isMuted: true, // don't flash the Q button on each signal
                });
            }else{
                return new q.Signal({
                    points:[[new q.Point('#FF0000',"BLINK")]],
                    name: "GPU Usage",
                    message: "Error: command cannot be executed. \n Please read documentation.",
                    isMuted: true, // don't flash the Q button on each signal
                });
            }

        });
    }

    async getGPUUsage() {
        return new Promise((resolve) => {
            try {
                exec('nvidia-smi --format=csv --query-gpu=memory.used,memory.total', (err, stdout) => {
                    var percent = -1
                    // handle errors
                    if (err) {
                        logger.error(err);
                        // handle NVIDIA compatibility
                        return resolve(percent);
                    }

                    var entries = parse(stdout, {
                        columns: true,
                        skip_empty_lines: true, 
                        trim: true
                    });

                    var memory_object = {
                        used: entries[0]['memory.used [MiB]'],
                        total: entries[0]['memory.total [MiB]']
                    };
                    var used = parseInt(memory_object.used.replace(' MiB', ''));
                    var total = parseInt(memory_object.total.replace(' MiB', ''));
                    percent = (used / total) * 100;

                    resolve(percent);
                });
            } catch(err) {
                logger.error(err);
                resolve(-1);
            }
        })
    }

    generateColor(percent) {
        let color =[];

        switch (true){
        case percent < 20:
            // return first color
            color.push(new q.Point(colors[0]));
            break;

        case percent < 40:
            // return second color
            color.push(new q.Point(colors[1]));
            break;

        case percent < 60:
            // return third color
            color.push(new q.Point(colors[2]));
            break;
        
        case percent < 80:
            // return fourth color
            color.push(new q.Point(colors[3]));
            break;

        case percent <= 100:
            // return fifth color
            color.push(new q.Point(colors[4]));
            break;

        default:
            // Should not happen: percent>100, return white color
            color.push(new q.Point("#FFFFFF"));
            break;
        };
        return color;
    }

}

module.exports = {
    GPUUsage: GPUUsage
};

const applet = new GPUUsage();