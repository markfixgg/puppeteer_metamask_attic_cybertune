import { Browser } from "puppeteer";
import { timeout, random_delay } from "../../../../utils";

import sheetsAPI from "../../../services/SheetsAPI";
import flows from "../../index";
import config from "../../../config";

export default async (browser: Browser, profile: IJSONAccount) => {
    const page = await browser.newPage();

    await page.goto(`https://atticc.xyz/users/${profile.wallet}/posts`, { waitUntil: 'domcontentloaded' });

    async function enable_free_mint(): Promise<void> {
        await page.waitForSelector('button[class*="MuiButton-outlineGradient"]', { visible: true });
        await page.click('button[class*="MuiButton-outlineGradient"]');

        await page.waitForSelector('input[id="isFreeMint"]', { visible: true });
        await page.click('input[id="isFreeMint"]')

        await page.waitForSelector('div[class*="MuiDialog-container"]:has(input[id="isFreeMint"]) div[class*="MuiDialogActions"] button:nth-child(2)', { visible: true });
        await page.click('div[class*="MuiDialog-container"]:has(input[id="isFreeMint"]) div[class*="MuiDialogActions"] button:nth-child(2)');
    }

    async function create_new_post(): Promise<void> {
        if (config.MAKE_POST) {
            await enable_free_mint()

            await timeout(2000);

            await page.waitForSelector('textarea[id="create-post-input-field"]', { visible: true });
            await page.type('textarea[id="create-post-input-field"]', profile.message);
            await page.click('button[type="submit"]:not([disabled])');

            await flows.metamask.notification(browser);

            await timeout(5000);
        }
    }

    async function collect_gift() {
        const gift = await page.$('div[class*="MuiIconButton-root"] svg:has(linearGradient)');

        if (gift) {
            await page.click('div[class*="MuiIconButton-root"] svg:has(linearGradient)');

            await page.waitForSelector('div[class*="MuiDialogContent-root"] button[class*="MuiButton-fillGradientSizeMedium"]', { visible: true });
            await page.click('div[class*="MuiDialogContent-root"] button[class*="MuiButton-fillGradientSizeMedium"]');

            await flows.metamask.notification(browser);
        }
    }

    const blocks = [ { message: "attic - creating post", method: create_new_post }, { message: "attic - collecting gift", method: collect_gift } ]
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    for (const block of blocks) {
        await block.method()
            .then(() => sheetsAPI.logger.info(`${block.message} success`, profile.id))
            .catch(() => sheetsAPI.logger.info(`${block.message} fail`, profile.id));

        await timeout(3000);
    }

    await page.close();
}