const puppeteer = require('puppeteer')

const scrapeTra = async (code, time) => {
    console.log("start puppeteer " + (new Date()).getTime());

    const hrs = time.slice(0, 2)
    const minutes = time.slice(2, 4)
    const seconds = time.slice(4, 6)

    const timeStr = `${hrs}:${minutes}:${seconds}`
    const url = `https://verify.tra.go.tz/${code}_${time}`

    const browser = await puppeteer.launch({
        args: ['--no-sandbox']
    })
    const page = await browser.newPage()
    await page.goto(url, {
        timeout: 0,
        waitUntil: 'networkidle0',
    })

    console.log("start evaluating");

    // await page.screenshot({
    //     path: 'page1.png'
    // })

    if (page.url() != `https://verify.tra.go.tz/Verify/Verified?Secret=${timeStr}`) {
        const input = await page.waitForSelector(".single-line", { visible: true, timeout: 0 })

        if (input != null) {
            console.log("filling input");
            await page.type('.single-line', `${code}`);
            const submitBtn = "button[type='submit']";
            await page.waitForSelector(submitBtn);
            await page.click(submitBtn);

            await page.waitForSelector("#HH", { visible: true, timeout: 0 })

            page.select('#HH', hrs);
            page.select('#MM', minutes);
            page.select('#SS', seconds);

            const submitBtn2 = "button[type='button']";
            await page.waitForSelector(submitBtn2);
            await page.click(submitBtn2);
        }

        // await page.screenshot({
        //     path: 'page2.png'
        // })
    }

    console.log("required selector available " + (new Date()).getTime());

    const scrapedData = await page.evaluate(() => {
        let results = [];
        let items = [];

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
        const receiptNumber = invoiceHeader[5].nextSibling.textContent.trim();
        const zNumber = invoiceHeader[6].nextSibling.textContent.trim();
        const receiptDate = invoiceHeader[7].nextSibling.textContent.trim();
        const receiptTime = invoiceHeader[8].nextSibling.textContent.trim();
        const receiptVerificationCode = '';

        // prices
        const receiptTotalExclOfTax = parseFloat(invoiceTable[1].children[0].children[1].innerText.trim().replace(',', ''));
        const receiptTotalTax = parseFloat(invoiceTable[1].children[1].children[1].innerText.trim().replace(',', ''));
        const receiptTotalInclOfTax = parseFloat(invoiceTable[1].children[2].children[1].innerText.trim().replace(',', ''));

        // items
        if (invoiceTable[0].children.length > 0) {
            Array.from(invoiceTable[0].children).forEach((item) => {
                items.push({
                    'item_description': item.children[0].innerText.trim(),
                    'item_qty': parseInt(item.children[1].innerText.trim()),
                    'item_amount': parseFloat(item.children[2].innerText.trim().replace(',', ''))
                });
            });
        }

        results.push({
            'company_name': companyName,
            'p_o_box': poBox,
            'mobile': mobile,
            'tin': tin,
            'vrn': vrn,
            'serial_no': serialNo,
            'uin': uin,
            'tax_office': taxOffice,
            'customer_name': customerName,
            'customer_id_type': customerIdType,
            'customer_id': customerId,
            'customer_mobile': customerMobile,
            'receipt_number': receiptNumber,
            'receipt_z_number': zNumber,
            'receipt_date': receiptDate,
            'receipt_time': receiptTime,
            'receipt_verification_code': receiptVerificationCode,
            'items': items,
            'receipt_total_excl_of_tax': receiptTotalExclOfTax,
            'receipt_total_tax': receiptTotalTax,
            'receipt_total_incl_of_tax': receiptTotalInclOfTax,
        });

        return results;
    });

    await browser.close()
    return scrapedData
}

module.exports.scrapeTra = scrapeTra