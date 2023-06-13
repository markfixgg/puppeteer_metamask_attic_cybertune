import { Browser, Page } from "puppeteer";

import { timeout, random_delay } from "../../../../utils";

import sheetsAPI from "../../../services/SheetsAPI";
import config from "../../../config";
import flows from "../../index";

export default async (browser: Browser, profile: IJSONAccount) => {
    const page = await browser.newPage();

    await page.goto('https://cybertune.xyz/creator', { waitUntil: 'networkidle2' });

    /**
     * STEP 1: Follow and Subscribe on 8 artists
     */
    await (async function process_page(): Promise<any> {
        // Wait until cards load
        while ((await page.$$('div[class*="CardAuthorBox"]')).length <= 0) {
            await timeout(1000);
        }

        // Find a page with block on which we can subscribe and follow
        const blocks = (await page.$$('div[class="mt-2.5 flex justify-between"]:not(:has([class*="ButtonSecondary"]))'))
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

        if (!blocks.length) {
            await page.waitForSelector('div[class="mt-5 flex justify-end"] button', { visible: true });

            // Can be [home, prev, next]
            const buttons = await page.$$('div[class="mt-5 flex justify-end"] button');
            await buttons[buttons.length - 1].click()

            await timeout(3000);

            return process_page();
        }

        for (const block of blocks.slice(0, 1)) {
            const follow = await block.$('div[class*="CardAuthorBox"] button[class*="ButtonPrimary"]:nth-child(1)');
            const subscribe = await block.$('div[class*="CardAuthorBox"] button[class*="ButtonPrimary"]:nth-child(2)');

            if (follow && config.SITES.CYBERTUNE.FOLLOW_ARTIST) {
                await follow.click();

                await timeout(3000);
            }

            if (subscribe && config.SITES.CYBERTUNE.SUBSCRIBE_ARTIST) {
                await subscribe.click();

                await flows.metamask.notification(browser);

                await timeout(3000);
            }

            await timeout(3000);
        }
    })()
        .then(() => sheetsAPI.logger.info('cybertune - Following to artist', profile.id))
        .catch(() => sheetsAPI.logger.error('cybertune - Error happened while following on artist', profile.id));

    /**
     * STEP 2: Open user profile by clicking on nickname (in header)
     */
    await (async function open_profile(): Promise<void> {
        await page.waitForSelector('div[class*="Header"] div[class*="space-x-1.5"] button[class*="ButtonSecondary"]');
        (await page.$('div[class*="Header"] div[class*="space-x-1.5"] button[class*="ButtonSecondary"]'))?.evaluate((button) => button.click());
    })()
        .then(() => sheetsAPI.logger.info('cybertune - Opening profile', profile.id))
        .catch(() => sheetsAPI.logger.error('cybertune - Error happened while opening profile', profile.id));

    /**
     * STEP 3: Write a new post in the profile
     */
    await (async function create_post(): Promise<void> {
        if (config.SITES.CYBERTUNE.MAKE_POST) {
            await page.waitForSelector('button:has(svg[viewBox="0 0 32 32"])', { visible: true });
            await page.click('button:has(svg[viewBox="0 0 32 32"])');

            await page.waitForSelector('div[data-headlessui-portal]:nth-child(2) input[name="title"]', { visible: true });
            await page.type('div[data-headlessui-portal]:nth-child(2) input[name="title"]', profile.message);

            await page.waitForSelector('div[data-headlessui-portal]:nth-child(2) textarea[name="body"]', { visible: true });
            await page.type('div[data-headlessui-portal]:nth-child(2) textarea[name="body"]', profile.message);

            await page.click('div[data-headlessui-portal]:nth-child(2) div[role="dialog"] button[class*="ButtonPrimary"]');

            await timeout(5000);
        }
    })()
        .then(() => sheetsAPI.logger.info('cybertune - Writing new post', profile.id))
        .catch(() => sheetsAPI.logger.error('cybertune - Error happened while writing new post', profile.id));

    /**
     * STEP 4: Leave like on newly created post
     */
    await (async function like(): Promise<void> {
        if (config.SITES.CYBERTUNE.LEAVE_LIKE) {
            await page.waitForSelector('div[class*="CardNFT"]:nth-child(1) button:nth-child(4)', { visible: true });
            await page.click('div[class*="CardNFT"]:nth-child(1) button:nth-child(4)', { count: 4, delay: 2000 });
        }
    })()
        .then(() => sheetsAPI.logger.info('cybertune - Liking newly created post', profile.id))
        .catch(() => sheetsAPI.logger.error('cybertune - Error happened while liking newly created post', profile.id));

    /**
     * STEP 4: Leave comment on newly created post
     */
    await (async function leave_comment() {
        if (config.SITES.CYBERTUNE.LEAVE_COMMENT) {
            await page.waitForSelector('div[class*="CardNFT"]:nth-child(1) button:nth-child(3)', { visible: true });
            await page.click('div[class*="CardNFT"]:nth-child(1) button:nth-child(3)');

            await page.waitForSelector('div[id="headlessui-portal-root"] textarea', { visible: true });
            await page.type('div[id="headlessui-portal-root"] textarea', profile.message);

            await page.click('div[id="headlessui-portal-root"] button[class*="ButtonPrimary"]');

            await timeout(5000);
        }
    })()
        .then(() => sheetsAPI.logger.info('cybertune - Leaving comment on newly created post', profile.id))
        .catch(() => sheetsAPI.logger.error('cybertune - Error happened while leaving comment on newly created post', profile.id));

    await page.close();
}

async function authorization(browser: Browser, page: Page) {
    await (async () => {
        await page.goto('https://cybertune.xyz/', { waitUntil: 'networkidle2' });

        await page.waitForSelector('div[class="hidden items-center xl:flex space-x-2"] button[data-testid="rk-connect-button"]', { visible: true }),
            await page.click('div[class="hidden items-center xl:flex space-x-2"] button[data-testid="rk-connect-button"]')

        await page.waitForSelector('button[data-testid="rk-wallet-option-metaMask"]', { visible: true });
        await page.click('button[data-testid="rk-wallet-option-metaMask"]');

        await timeout(3000);
    })()

    await flows.metamask.notification(browser)
        .catch((error) => console.error(error));

    await (async () => {
        await page.waitForSelector('div[class="flex w-full"] div[class="grid"] button:not([disabled])', { visible: true });
        await page.click('div[class="flex w-full"] div[class="grid"] button:not([disabled])');

        await page.waitForSelector('input[placeholder="Quantity"]', { visible: true });
        await page.type('input[placeholder="Quantity"]', '1');

        await page.click('form:has(input[placeholder="Quantity"]) button');
    })()

    await flows.metamask.notification(browser)
        .catch((error) => console.error(error));
}