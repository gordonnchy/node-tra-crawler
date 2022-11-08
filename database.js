var sqlite3 = require('sqlite3').verbose();
var md5 = require('md5');

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.log(err.message);
        throw err;
    } else {
        console.log('connected to sqlite database.');
        db.run(`CREATE TABLE receipts (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            receipt_code text,
            company_name text,
            po_box text,
            mobile text,
            tin text,
            vrn text,
            serial_no text,
            uin text,
            tax_office text,
            customer_name text,
            customer_id_type text,
            customer_id text,
            customer_mobile text,
            receipt_no text,
            z_number text,
            receipt_date text,
            receipt_time text,
            total_excl_of_tax text,
            total_tax text,
            total_incl_of_tax text
        )`, 
        (err) => {
            if (err) {
                // Table already created
            } else {
                // Table just created, creating some rows
            }
        });
    }
});

module.exports = db