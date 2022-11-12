const puppeteer = require('puppeteer')

const scrapeTra = async (code, time) => {
    const hrs = time.slice(0, 2)
    const minutes = time.slice(2, 4)
    const seconds = time.slice(4, 6)

    const timeStr = `${hrs}:${minutes}:${seconds}`
    const url = `https://verify.tra.go.tz/${code}_${time}`

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url, {
        timeout: 0,
        waitUntil: 'networkidle0'
    })

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
        const receiptTotalExclOfTax = invoiceTable[1].children[0].children[1].innerText.trim();
        const receiptTotalTax = invoiceTable[1].children[1].children[1].innerText.trim();
        const receiptTotalInclOfTax = invoiceTable[1].children[2].children[1].innerText.trim();

        // items
        if (invoiceTable[0].children.length > 0) {
            Array.from(invoiceTable[0].children).forEach((item) => {
                items.push({
                    'item_description': item.children[0].innerText.trim(),
                    'item_qty': item.children[1].innerText.trim(),
                    'item_amount': item.children[2].innerText.trim()
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