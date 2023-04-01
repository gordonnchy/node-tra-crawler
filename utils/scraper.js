const puppeteer = require('puppeteer');

const extractInvoiceData = async (page) => {
    return await page.evaluate(() => {
        let results = [];
        let items = [];

        const getText = (el) => el.innerText.trim();
        const getSiblingText = (el) => el.nextSibling.textContent.trim();
        const parseFloatWithComma = (val) => parseFloat(val.trim().replaceAll(',', ''));

        const invoiceHeader = document.querySelectorAll(".invoice-header b");
        const invoiceInfo = document.querySelectorAll(".invoice-info .invoice-col b");
        const invoiceTable = document.querySelectorAll('.table table.table tbody');

        const company = {
            'company_name': getText(invoiceHeader[0]),
            'p_o_box': getText(invoiceInfo[0]),
            'mobile': getSiblingText(invoiceInfo[1]),
            'tin': getSiblingText(invoiceInfo[2]),
            'vrn': getSiblingText(invoiceInfo[3]),
            'serial_no': getSiblingText(invoiceInfo[4]),
            'uin': getSiblingText(invoiceInfo[5]),
            'tax_office': getSiblingText(invoiceInfo[6]),
        };

        const customer = {
            'customer_name': getSiblingText(invoiceHeader[1]),
            'customer_id_type': getSiblingText(invoiceHeader[2]),
            'customer_id': getSiblingText(invoiceHeader[3]),
            'customer_mobile': getSiblingText(invoiceHeader[4]),
        };

        const receipt = {
            'receipt_number': getSiblingText(invoiceHeader[5]),
            'receipt_z_number': getSiblingText(invoiceHeader[6]),
            'receipt_date': getSiblingText(invoiceHeader[7]),
            'receipt_time': getSiblingText(invoiceHeader[8]),
            'receipt_verification_code': getText(document.querySelectorAll(".invoice-header")[3].children[1].firstChild),
        };

        const pricesTable = invoiceTable[1];
        const noOFRows = pricesTable.children.length;
        let receiptTotalDiscount = 0;

        const receiptTotalExclOfTax = parseFloatWithComma(getText(pricesTable.children[0].children[1]));

        if (noOFRows === 5) {
            receiptTotalDiscount = parseFloatWithComma(getText(pricesTable.children[1].children[1]));
        }

        const receiptTotalTax = parseFloatWithComma(getText(pricesTable.children[noOFRows - 2].children[1]));
        const receiptTotalInclOfTax = parseFloatWithComma(getText(pricesTable.children[noOFRows - 1].children[1]));

        const itemsTable = invoiceTable[0];
        if (itemsTable.children.length > 0) {
            Array.from(itemsTable.children).forEach((item) => {
                items.push({
                    'item_description': getText(item.children[0]),
                    'item_qty': parseInt(getText(item.children[1])),
                    'item_amount': parseFloatWithComma(getText(item.children[2])),
                });
            });
        }

        results.push({
            ...company,
            ...customer,
            ...receipt,
            items,
            receipt_total_excl_of_tax: receiptTotalExclOfTax,
            receipt_total_discount: receiptTotalDiscount,
            receipt_total_tax: receiptTotalTax,
            receipt_total_incl_of_tax: receiptTotalInclOfTax,
        });

        return results;
    });
};

const scrapeTra = async (code, time) => {
    console.log("start puppeteer " + (new Date()).getTime());

    const hrs = time.slice(0, 2)
    const minutes = time.slice(2, 4)
    const seconds = time.slice(4, 6)

    const timeStr = `${hrs}:${minutes}:${seconds}`
    const url = `https://verify.tra.go.tz/${code}_${time}`
    let response = {};

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();

        await page.goto(url, {
            timeout: 0,
            waitUntil: 'networkidle0',
        });

        if (page.url() != `https://verify.tra.go.tz/Verify/Verified?Secret=${timeStr}`) {
            if (page.url() === 'https://verify.tra.go.tz/Home/Index') {
                const input = await page.waitForSelector(".single-line", { visible: true, timeout: 0 });

                if (input != null) {
                    await page.type('.single-line', `${code}`);
                    const submitBtn = "button[type='submit']";
                    await page.waitForSelector(submitBtn);
                    await page.click(submitBtn);
                }
            }

            await page.waitForSelector("#HH", { visible: true, timeout: 0 })

            page.select('#HH', hrs);
            page.select('#MM', minutes);
            page.select('#SS', seconds);

            const submitBtn2 = "button[type='button']";
            await page.waitForSelector(submitBtn2);
            await page.click(submitBtn2);


            if (page.url() === `https://verify.tra.go.tz/${code}`) {
                response =  {
                    'code': '400',
                    'message': 'Invalid Code or Time'
                };
            } else if (page.url() === `https://verify.tra.go.tz/Verify/Verified?Secret=${timeStr}`) {
                response = await extractInvoiceData(page);
            } else {
                response = {
                    'code': '404',
                    'message': 'Missing Receipt'
                }
            }
        } else {
            response = await extractInvoiceData(page);
        }

        await browser.close();

        return response;
    } catch (error) {
        console.error('Error during scraping:', error);
        return null;
    }
};

module.exports.scrapeTra = scrapeTra