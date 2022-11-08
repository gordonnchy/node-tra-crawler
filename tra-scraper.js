const puppeteer = require('puppeteer');

// const receiptCode = process.argv[2];
// const receiptTime = process.argv[3];

// if (!receiptCode || !receiptTime) {
//     throw 'Either receiptCode or receiptTime is missing!';
// }

function run (code, time) {
    return new Promise(async (resolve, reject) => {
        try {

            const hrs = time.slice(0, 2);
            const minutes = time.slice(2, 4);
            const seconds = time.slice(4, 6);

            const timeStr = `${hrs}:${minutes}:${seconds}`;

            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(`https://verify.tra.go.tz/${code}_${time}`);
            await page.screenshot({path: `tra-${code}.png`});

            if (page.url() == "https://verify.tra.go.tz/Home/Index") {
                // Type into Enter Receipt Verification Code
                await page.type('.single-line', `${code}`);

                const submitBtn = '.btn-block';
                await page.waitForSelector(submitBtn);
                await page.click(submitBtn);
            }

            if (page.url() == `https://verify.tra.go.tz/${code}`) {
                // hours
                page.select('#HH', hrs);

                // minutes
                page.select('#MM', minutes);

                // seconds
                page.select('#SS', seconds);

                const submitBtn = '.btn-block';
                await page.waitForSelector(submitBtn);
                await page.click(submitBtn);
            }

            if (page.url() == `https://verify.tra.go.tz/Verify/Verified?Secret=${timeStr}`) {
                let contents = await page.evaluate(() => {
                    let results = [];
    
                    // invoice header section
                    const invoiceHeader = document.querySelectorAll(".invoice-header b");
    
                    // invoice info section
                    const invoiceInfo = document.querySelectorAll(".invoice-info .invoice-col b");
    
                    // invoice tables
                    const invoiceTable = document.querySelectorAll('.table table.table tbody');
    
                    // company
                    const companyName = invoiceHeader[0].innerText.trim();
                    const poBox = invoiceInfo[0].innerText.trim();
                    const mobile = invoiceInfo[1].nextSibling.textContent.trim();
                    const tin = invoiceInfo[2].nextSibling.textContent.trim();
                    const vrn = invoiceInfo[3].nextSibling.textContent.trim();
                    const serialNo = invoiceInfo[4].nextSibling.textContent.trim();
                    const uin = invoiceInfo[5].nextSibling.textContent.trim();
                    const taxOffice = invoiceInfo[6].nextSibling.textContent.trim();
    
                    // customer
                    const customerName = invoiceHeader[1].nextSibling.textContent.trim();
                    const customerIdType = invoiceHeader[2].nextSibling.textContent.trim();
                    const customerId = invoiceHeader[3].nextSibling.textContent.trim();
                    const customerMobile = invoiceHeader[4].nextSibling.textContent.trim();
    
                    // receipt
                    const receiptNo = invoiceHeader[5].nextSibling.textContent.trim();
                    const zNumber = invoiceHeader[6].nextSibling.textContent.trim();
                    const receiptDate = invoiceHeader[7].nextSibling.textContent.trim();
                    const receiptTime = invoiceHeader[8].nextSibling.textContent.trim();
    
                    // prices
                    const totalExclOfTax = invoiceTable[1].children[0].children[1].innerText.trim();
                    const totalTax = invoiceTable[1].children[1].children[1].innerText.trim();
                    const totalInclOfTax = invoiceTable[1].children[2].children[1].innerText.trim();
                    
                    results.push({
                        companyName,
                        poBox,
                        mobile,
                        tin,
                        vrn,
                        serialNo,
                        uin,
                        taxOffice,
                        customerName,
                        customerIdType,
                        customerId,
                        customerMobile,
                        receiptNo,
                        zNumber,
                        receiptDate,
                        receiptTime,
                        totalExclOfTax,
                        totalTax,
                        totalInclOfTax,
                    });
    
                    return results;
                });
                resolve(contents);
            } else {
                resolve([]);
            }
            
            browser.close();
        } catch (e) {
            reject(e);
        }
    });
}

// run(receiptCode, receiptTime).then(console.log).catch(console.error);
module.exports = { run }