import { Browser } from "puppeteer";
import { timeout, random_delay } from "../../../../utils";

import sheetsAPI from "../../../services/SheetsAPI";
import config from "../../../config";
import flows from "../../index";

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

        await sheetsAPI.logger.info('atticc - free mint enabled', profile.id);
    }

    async function create_new_post(): Promise<void> {
        if (config.SITES.ATTICC.MAKE_POST) {
            await page.reload({ waitUntil: "networkidle2" });

            await enable_free_mint();

            await timeout(2000);

            await page.waitForSelector('textarea[id="create-post-input-field"]', { visible: true });
            await page.type('textarea[id="create-post-input-field"]', profile.message);
            await page.click('button[type="submit"]:not([disabled])');

            await flows.metamask.notification(browser);

            await sheetsAPI.logger.info('atticc - post created', profile.id);

            await timeout(3000);
        }
    }

    async function collect_gift() {
        if (config.SITES.ATTICC.COLLECT_GIFT) {
            await page.reload({ waitUntil: "networkidle2" });

            await page.waitForSelector('div[class*="MuiIconButton-root"] svg:has(linearGradient)', { visible: true, timeout: 60000 });

            // How much collect button we will check
            const buttons = (await page.$$('div[class*="MuiIconButton-root"] svg:has(linearGradient)')).slice(0, 5);

            for (const button of buttons) {
                await button.click();

                const dialog = await page.waitForSelector('div[class*="MuiDialog-root"]', { visible: true, timeout: 60000 }).catch(() => null);
                if (!dialog) {
                    await page.click('div[class*="MuiDialog-root"] button[aria-label="close"]').catch(() => {});

                    continue;
                }

                const collect = await page.$('div[class*="MuiDialog-root"] button[class*="MuiButton-fillGradientPrimary"]:not([disabled])');

                if (!collect) {
                    await page.click('div[class*="MuiDialog-root"] button[aria-label="close"]');

                    await timeout(3000);

                    continue;
                }

                await collect.click();

                await flows.metamask.notification(browser);

                return sheetsAPI.logger.info('atticc - gift collected', profile.id);
            }

            return sheetsAPI.logger.error('atticc - gift not found', profile.id);
        }
    }

    const blocks = [ { message: "attic - creating post", method: create_new_post }, { message: "attic - collecting gift", method: collect_gift } ]
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    for (const block of blocks) {
        await block.method()
            .catch(() => sheetsAPI.logger.error(`${block.message} | unhandled error`, profile.id));

        await timeout(3000);
    }

    await page.close();
}