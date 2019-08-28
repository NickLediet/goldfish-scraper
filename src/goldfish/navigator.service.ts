import { Injectable, Inject } from '@nestjs/common'
import * as puppeteer from 'puppeteer'
import { INavigatorParams } from './navigatorParams.interface';
import * as uuid from 'uuid'

require('dotenv').config()

@Injectable()
export class NavigatorService {
  private config: INavigatorParams = {
    numberOfTopRows: 5,
    numberOfBottomRows: 5
  }

  public constructor(
    @Inject('Pupeteer')
    private browser: puppeteer.Browser
  ) {}

  public setConfig(config: INavigatorParams) {
    this.config = config;
  }

  public async today() {
    try {
      await this.loginToGoldfish() // Create authenticated session
      return await this.scrapeCollection()
    } catch(err) {
      console.error(err)
    }
  }

  /**
   * Login to Goldfish and return authenticated session
   */
  private async loginToGoldfish() {
    const page = await this.browser.newPage()

    await page.goto('https://www.mtggoldfish.com/portfolio#paper')

    // @ts-ignore
    const authenticated = !(await page.evaluate(() => document.querySelector('.layout-login-btn.sprite-login-facebook').offsetParent))

    if(authenticated) {
      return page.close()
    }

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

    page.close()
  }

  /**
   * Query golfish collection via authenticated session
   * @param page Authenticate Puppeteer Page
   */
  private async scrapeCollection() {
    // Spin up a new tab and wait for return for the process
    const data = await Promise.all([
      this.getCollectionTotals(await this.generateNewPage()),
      this.getTopRows(await this.generateNewPage())
    ])

    return data.reduce((acc, tar) => ({ ...acc, ...tar}), {})
  }

  private async getCollectionTotals(page: puppeteer.Page) {
    return await page.evaluate(() => ({
      totalCollectionValue:
        parseInt(document.querySelector('p.total-value')
          .textContent
          .replace(/\$|\,/g, '')),
      collectionDailyChange: parseFloat(
        document.querySelector('.index-price-header-price').textContent
      )
    }))
  }

  private async getTopRows(page: puppeteer.Page) {
    // Setup
    // Click all cards
    await page.click('a.tab-title[href=\'#tab-all\']')

    // Click Daily $
    await page.waitForSelector('.col-daily button')
    await page.click('.col-daily button')

    await page.waitForSelector('.col-filter-form .sort-icon.glyphicon.glyphicon-chevron-down')

    const cards = await page.evaluate((config) => {
      let rows = document.querySelector('.tablesorter').querySelectorAll('tr')
      const values = []

      rows.forEach((row, index) => {
        if(index === 0 || index >= parseInt(config.numberOfTopRows) + 1) return

        const dailyPrice = row.querySelector('.col-daily .common-price-change > span')

        values.push({
          id: row.id,
            collectionDailyChange: parseFloat(dailyPrice ? dailyPrice.textContent : '0')
        })
      })

      return values
    }, {...this.config})

    return { topWinners: cards }
  }

  private async generateNewPage(): Promise<puppeteer.Page> {
    const page = await this.browser.newPage()

    // page.on('console', val => console.log(`[BROWSER ${uuid.v1()}]: ${val.text()}`))

    await page.goto('https://www.mtggoldfish.com/portfolio#paper')
    await page.waitForSelector('p.total-value') // Wait for goldfish collection redirect

    return page
  }
}
