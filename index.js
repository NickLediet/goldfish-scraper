require('dotenv').config()

const puppeteer = require('puppeteer')

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


    const data = await page.evaluate(() => { 
        return {
            totalCollectionValue: 
                parseInt(document.querySelector('p.total-value')
                    .textContent
                    .replace(/\$|\,/g,'')),
            collectionDailyChange: parseFloat(document.querySelector('.index-price-header-price').textContent)
        }
    })

    console.log(data)

    await browser.close()
}

main()