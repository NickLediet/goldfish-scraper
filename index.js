require('dotenv').config()

const puppeteer = require('puppeteer')

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sleep(fn, ...args) {
    await timeout(3000);
    return fn(...args);
}

const main = async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    console.log('Going to your login')
    await page.goto('https://www.mtggoldfish.com/portfolio#paper')

    await page.waitForSelector('.layout-login-btn.sprite-login-facebook')

    await page.click('.layout-login-btn.sprite-login-facebook')

    console.log('Navigating to facebook')
    await page.waitForSelector('button[name=login]')


    await page.focus('input[name=email]')
    await page.keyboard.type(process.env.FACEBOOK_USER)

    await page.focus('input[name=pass]')
    await page.keyboard.type(process.env.FACEBOOK_PASSWORD)

    await page.click('button[name=login]')

    await page.waitForSelector('p.total-value')

   // Get initial collection data
    let data = await page.evaluate(() => {
        return {
            totalCollectionValue:
                parseInt(document.querySelector('p.total-value')
                    .textContent
                    .replace(/\$|\,/g,'')),
            collectionDailyChange: parseFloat(document.querySelector('.index-price-header-price').textContent)
        }
    })

    // Click all cards
    await page.click('a.tab-title[href=\'#tab-all\']')

    // Click Dails $
    await page.waitForSelector('.col-daily button')
    await page.click('.col-daily button')

    await timeout(3000)

    // Get Data
    data = {
        ...data,
        ...await page.evaluate(() => {
            // Get rows
            const rows = document.querySelector('.tablesorter').querySelectorAll('tr')
            // return { rows: rows.innerHTML}
            const values = []
            let index = 0;

            for(const row of rows) {
                console.log(index)
                if(index < 1) {
                    index++
                    continue
                }

                if(index > 6) {
                    index++
                    break
                }

                index++
                let dailyPrice = row.querySelector('.col-daily .common-price-change > span')
                const rowData = {
                    id: row.id,
                    collectionDailyChange: parseFloat(dailyPrice ? dailyPrice.textContent : 0)
                }

                values.push(rowData)
            }

            return { topCards: values }
        })
    }

        // Click Dails $
        await page.waitForSelector('.col-daily button')
        await page.click('.col-daily button')

        await timeout(3000)

        // Get Data
        data = {
            ...data,
            ...await page.evaluate(() => {
                // Get rows
                const rows = document.querySelector('.tablesorter').querySelectorAll('tr')
                // return { rows: rows.innerHTML}
                const values = []
                let index = 0;

                for(const row of rows) {

                    if(!row.querySelector('.col-price ').innerHTML) {
                        continue;
                    }

                    if(index < 1) {
                        index++
                        continue
                    }

                    if(index > 6) {
                        index++
                        break
                    }

                    index++

                    let dailyPrice = row.querySelector('.col-daily .common-price-change > span')

                    const rowData = {
                        id: row.id,
                        collectionDailyChange: parseFloat(dailyPrice ? dailyPrice.textContent : 0)
                    }

                    values.push(rowData)
                }

                return { lowestCards: values }
            })
        }


    console.log(data)

    await browser.close()
}

main()
