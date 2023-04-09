const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(path.dirname(require.main.filename), 'data', 'request.json');

module.exports = class Request {
    constructor(id, ip, time, status) {
        this.id = id;
        this.ip = ip;
        this.time = time;
        this.status = status;
    }

    save(cb) {
        fs.readFile(dataFilePath, (err, fileContent) => {
            this.id = (new Date()).getTime().toString();
            let requests = [];
            if (!err) {
                requests = JSON.parse(fileContent);
            }
            requests.push(this);
            fs.writeFile(dataFilePath, JSON.stringify(requests), err => {
                if (err) {
                    console.log(err);
                }
                cb();
            });
        });
    }

    static all(cb) {
        fs.readFile(dataFilePath, (err, fileContent) => {
            let requests = [];
            if (!err) {
                requests = JSON.parse(fileContent);
            }
            cb(requests);
        });
    }
}