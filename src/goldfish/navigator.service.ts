import { Injectable, Inject } from '@nestjs/common'
import * as puppeteer from 'puppeteer'

require('dotenv').config()

@Injectable()
export class NavigatorService {
  public constructor(
    @Inject('Pupeteer')
    private browser: puppeteer.Browser
  ) {}

  public async test() {
    try {
      const page: puppeteer.Page = await this.loginToGoldfish()

      const data = await this.scrapeCollection(page)

    } catch(err) {
      console.error(err)
    }
  }

  /**
   * Login to Goldfish and return authenticated session
   */
  private async loginToGoldfish(): Promise<puppeteer.Page> {
    const page = await this.browser.newPage()

    await page.goto('https://www.mtggoldfish.com/portfolio#paper')

    // Find and click Facebook SSO button
    await page.waitForSelector('.layout-login-btn.sprite-login-facebook')
    await page.click('.layout-login-btn.sprite-login-facebook')

    // Verify page is ready
    await page.waitForSelector('button[name=login]')

    await page.focus('input[name=email]')
    await page.keyboard.type(process.env.FACEBOOK_USER)

    await page.focus('input[name=pass]')
    await page.keyboard.type(process.env.FACEBOOK_PASSWORD)

    await page.click('button[name=login]')
    await page.waitForSelector('p.total-value') // Wait for goldfish collection redirect

    return page
  }

  /**
   * Query golfish collection via authenticated session
   * @param page Authenticate Puppeteer Page
   */
  private async scrapeCollection(page: puppeteer.Page) {
    // Get initial collection data
    let data = await page.evaluate(() => ({
        totalCollectionValue:
          parseInt(document.querySelector('p.total-value')
            .textContent
            .replace(/\$|\,/g, '')),
        collectionDailyChange: parseFloat(
          document.querySelector('.index-price-header-price').textContent
        )
    }))

    return data
  }

}
