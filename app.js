const { run } = require('./tra-scraper');
const express = require('express');
const app = express();
const db = require("./database.js");
const port = 3000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/receipt/:code/:time', (req, res) => {
    try {
        db.get('SELECT * FROM receipts WHERE receipt_code = ?', [req.params.code], (err, rows) => {
            if (err) {
                res.status(400).json({"error":err.message});
                return;
            }
            res.json({
                "message": "success",
                "data": rows
            });
            return;
        });

        run(req.params.code, req.params.time)
            .then((response) => {
                console.log(response);
                var data = response[0];
                if (data) {
                    db.run(`INSERT INTO receipts (receipt_code,company_name,po_box,mobile,tin,vrn,serial_no,uin,tax_office,customer_name,customer_id_type,customer_id, customer_mobile,receipt_no,z_number,receipt_date,receipt_time,total_excl_of_tax,total_tax,total_incl_of_tax) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                        [req.params.code,data.companyName, data.poBox, data.mobile, data.tin, data.vrn, data.serialNo, data.uin, data.taxOffice, data.customerName, data.customerIdType, data.customerId, data.customerMobile, data.receiptNo, data.zNumber, data.receiptDate, data.receiptTime, data.totalExclOfTax, data.totalTax, data.totalInclOfTax]
                    );
                    res.send(data);
                    return;
                }

                res.send({status: true});
            })
            .catch((err) => {
                console.log(err);
            });
    } catch {
        res.json({});
    }
});

app.use((req, res) => {
    res.status(404);
}); 