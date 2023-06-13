import { Browser, ElementHandle } from "puppeteer";
import { timeout, random_delay } from "../../../../utils";

export default async (browser: Browser) => {
    const page = await browser.newPage();

    await page.goto('https://link3.to/cyberconnect/fanclub', { waitUntil: 'networkidle2' });

    await (async function navigate_to_collect_section(): Promise<void> {
        const section = await page.waitForSelector('section:nth-child(3)', { visible: true });

        await page.evaluate((element: any) => element.scrollIntoView(), section);
    })();

    await (async function collect_all_rewards(): Promise<void> {
        const elements  = await page.$$('section:nth-child(3) button:not([disabled])');

        // Add retry counter to each button and shuffle an array
        const buttons = elements
            .reduce((array: { retries: number; button: ElementHandle<HTMLButtonElement> }[], button: ElementHandle<HTMLButtonElement>) => [ ...array, { retries: 1, button } ], [])
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

        while (buttons.length) {
            const { retries, button } = buttons.shift() || {};

            if (button && retries) {
                if (retries > 1) await timeout(20000);

                await button.click();

                await timeout(3000);

                const classname = await (await button.getProperty('className')).jsonValue();
                const disabled = await (await button.getProperty('disabled')).jsonValue();

                // Sometimes button already clicked once, and we need to click only one time
                if (disabled) continue;

                if (classname.includes('MuiButton-containedPrimary')) {
                    await button.click();

                    await timeout(3000);

                    const disabled = await (await button.getProperty('disabled')).jsonValue();
                    if (disabled) continue;
                }

                if (retries <= 3) {
                    buttons.push({ retries: retries + 1, button });
                }
            }
        }

        await timeout(5000);
    })();

    await page.close();
}