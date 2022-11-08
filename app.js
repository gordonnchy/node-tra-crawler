const { run } = require('./tra-scraper');
const express = require('express');
const app = express();
const db = require("./database.js");
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/receipt/:code/:time', (req, res) => {
    try {
        run(req.params.code, req.params.time)
            .then((response) => {
                console.log(response);
                var data = response[0];
                if (data) {
                    db.run('INSERT INTO receipts VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                        [data.companyName, data.poBox, data.mobile, data.tin, data.vrn, data.serialNo, data.uin, data.taxOffice, data.customerName, data.customerIdType, data.customerId, data.customerMobile, data.receiptNo, data.zNumber, data.receiptDate, data.receiptTime, data.totalExclOfTax, data.totalTax, data.totalInclOfTax],
                        (err) => {
                            console.log(err.message);
                        }
                    );
                }
            })
            .catch((err) => {
                console.log(err);
            });
    } catch {
        res.json({});
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});