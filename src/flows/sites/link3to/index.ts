import { Browser, ElementHandle } from "puppeteer";
import { timeout, random_delay } from "../../../../utils";

import sheetsAPI from "../../../services/SheetsAPI";
import config from "../../../config";

export default async (browser: Browser, profile: IJSONAccount) => {
    const page = await browser.newPage();

    await page.goto('https://link3.to/cyberconnect/fanclub', { waitUntil: 'networkidle2' });

    await (async function navigate_to_collect_section(): Promise<void> {
        await page.waitForSelector('section:nth-child(n+1)', { visible: true });

        const [ section ]  = await page.$x('//section[.//h6[contains(text(), "CyberConnect Protocol Engagement")]]');
        if (!section) throw new Error('Section "CyberConnect Protocol Engagement" not found');

        await page.evaluate((element: any) => element.scrollIntoView(), section);
    })()
        .catch((error) => sheetsAPI.logger.error(error.message, profile.id));

    await (async function collect_all_rewards(): Promise<void> {
        const [ section ]  = await page.$x('//section[.//h6[contains(text(), "CyberConnect Protocol Engagement")]]');
        if (!section) return;

        const actions: Record<string, boolean> = {
            "Like a Post": config.SITES.LINK3.LIKE_POST,
            "Collect an EssenceNFT": config.SITES.LINK3.COLLECT_NFT,
            "Comment": config.SITES.LINK3.COMMENT_CLAIM,
            "Create a Post": config.SITES.LINK3.CREATE_POST,
            "Follow a Profile": config.SITES.LINK3.FOLLOW_PROFILE,
            "Create an EssenceNFT": config.SITES.LINK3.CREATE_NFT,
            "Subscribe a Profile": config.SITES.LINK3.SUBSCRIBE_PROFILE,
        }

        const blocks = await section.$$('div > div:has(button:not([disabled]))');
        const buttons: { title: string; element: ElementHandle<HTMLButtonElement> }[] = [];

        for (const block of blocks) {
            const h4 = await block.$('h4');
            if (!h4) continue;

            const title = await h4.evaluate((h4) => h4.textContent) || "";
            const enabled = actions[title];

            if (enabled) {
                const button = await block.$('button:not([disabled])');

                if (button) buttons.push({ title, element: button});
            }
        }

        const shuffled_buttons = buttons
            .reduce((array: { retries: number; button: { title: string; element: ElementHandle<HTMLButtonElement> } }[], button: { title: string; element: ElementHandle<HTMLButtonElement> }) => [ ...array, { retries: 1, button } ], [])
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

        while (shuffled_buttons.length) {
            const { retries, button } = shuffled_buttons.shift() || {};

            if (button && retries) {
                const { title, element } = button;

                if (retries > 1) await timeout(20000);

                await element.click();

                await timeout(3000);

                const textContent = (await element.evaluate((element) => element.textContent || "")).toLowerCase();
                const classname = await (await element.getProperty('className')).jsonValue();
                const disabled = await (await element.getProperty('disabled')).jsonValue();

                // Sometimes button already clicked once, and we need to click only one time
                if (disabled && textContent.includes('claimed')) {
                    await sheetsAPI.logger.info(title, profile.id);

                    continue;
                }

                if (classname.includes('MuiButton-containedPrimary')) {
                    await element.click();

                    await timeout(3000);

                    const textContent = (await element.evaluate((element) => element.textContent || "")).toLowerCase();
                    const disabled = await (await element.getProperty('disabled')).jsonValue();

                    if (disabled && textContent.includes('claimed')) {
                        await sheetsAPI.logger.info(title, profile.id);

                        continue;
                    }
                }

                if (retries <= 3) {
                    shuffled_buttons.push({ retries: retries + 1, button });
                }
            }
        }

        await timeout(5000);
    })();

    await (async function log_disabled_buttons () {
        const [ section ]  = await page.$x('//section[.//h6[contains(text(), "CyberConnect Protocol Engagement")]]');

        const buttons = await section.$$('button[disabled]');
        const disabled = [];

        for (const button of buttons) {
            const textContent = (await button.evaluate((button) => button.textContent || "")).toLowerCase();

            if (textContent.includes('claimed')) disabled.push(button);
        }

        await sheetsAPI.logger.info(`Claimed buttons: ${disabled.length}`, profile.id);
    })();

    await page.close();
}