import { Browser } from "puppeteer";
import { timeout, random_delay } from "../../../../utils";

import sheetsAPI from "../../../services/SheetsAPI";
import flows from "../../index";

export default async (browser: Browser, profile: IJSONAccount) => {
    const page = await browser.newPage();

    await page.goto(`https://atticc.xyz/users/${profile.wallet}/posts`, { waitUntil: 'domcontentloaded' });

    await (async function enable_free_mint(): Promise<void> {
        await page.waitForSelector('button[class*="MuiButton-outlineGradient"]', { visible: true });
        await page.click('button[class*="MuiButton-outlineGradient"]');

        await page.waitForSelector('input[id="isFreeMint"]', { visible: true });
        await page.click('input[id="isFreeMint"]')

        await page.waitForSelector('div[class*="MuiDialog-container"]:has(input[id="isFreeMint"]) div[class*="MuiDialogActions"] button:nth-child(2)', { visible: true });
        await page.click('div[class*="MuiDialog-container"]:has(input[id="isFreeMint"]) div[class*="MuiDialogActions"] button:nth-child(2)');
    })()
        .then(() => sheetsAPI.logger.info('atticc - Enabled free mint', profile.id))
        .catch(() => sheetsAPI.logger.error('atticc - Unable to enable free mint', profile.id));

    await (async function create_new_post(): Promise<void> {
        await page.waitForSelector('textarea[id="create-post-input-field"]', { visible: true });
        await page.type('textarea[id="create-post-input-field"]', profile.message);
        await page.click('button[type="submit"]:not([disabled])');

        await flows.metamask.notification(browser);

        await timeout(5000);
    })()
        .then(() => sheetsAPI.logger.info(`atticc - Created new post with message: ${profile.message}`, profile.id))
        .catch(() => sheetsAPI.logger.error('atticc - Unable to created new post', profile.id));

    await (async function collect_gift() {
        const gift = await page.$('div[class*="MuiIconButton-root"] svg:has(linearGradient)');
        if (gift) {
            await page.click('div[class*="MuiIconButton-root"] svg:has(linearGradient)');

            await page.waitForSelector('div[class*="MuiDialogContent-root"] button[class*="MuiButton-fillGradientSizeMedium"]', { visible: true });
            await page.click('div[class*="MuiDialogContent-root"] button[class*="MuiButton-fillGradientSizeMedium"]');

            await flows.metamask.notification(browser);
        }
    })()
        .then(() => sheetsAPI.logger.info(`atticc - Collected the gift`, profile.id))
        .catch(() => sheetsAPI.logger.error('atticc - Unable to collect the gift', profile.id));

    await page.close();
}