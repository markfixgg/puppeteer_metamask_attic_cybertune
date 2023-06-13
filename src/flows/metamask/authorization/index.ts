import { Browser, Page, Target } from "puppeteer";

export default async (browser: Browser, page: Page, profile: IJSONAccount) => {
    const extension: Target = await (async () => {
        while (true) {
            for (const target of browser.targets()) {
                const page = await target.page();
                if (!page) continue;

                const script = await page.evaluate(() => document.querySelector('script[src="./snow.js"]'));
                if (script) return target;
            }
        }
    })();

    const extension_id = new URL(extension.url()).host;

    await page.goto(`chrome-extension://${extension_id}/home.html`, { waitUntil: 'networkidle2' });

    await page.waitForSelector('input[id="password"]', { visible: true });
    await page.type('input[id="password"]', profile.password);

    await page.click('button[data-testid="unlock-submit"]');
}