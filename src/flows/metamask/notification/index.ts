import { Browser, Page, Target } from "puppeteer";
import { timeout, to, wait, random_delay } from "../../../../utils";

const markers = {
    'confirm-page-container-summary': 'div[class="confirm-page-container-summary"]',
    'signature-request-siwe': 'div[class="signature-request-siwe"]',
    'permissions-connect': 'div[class="permissions-connect"]',
}

const functions = {
    'confirm-page-container-summary': async (page: Page) => {
        await page.waitForSelector('div[class="transaction-detail-edit"] button', { visible: true });
        await page.click('div[class="transaction-detail-edit"] button');

        await page.waitForSelector('div[class="advanced-gas-controls"] div[class="form-field"]:nth-child(2) input', { visible: true });
        await page.click('div[class="advanced-gas-controls"] div[class="form-field"]:nth-child(2) input', { count: 3 });
        await page.type('div[class="advanced-gas-controls"] div[class="form-field"]:nth-child(2) input', '1');

        await page.click('div[class="popover-container"] button[class*="btn-primary"]');

        // DECLINE
        // await page.waitForSelector('button[class*="btn-secondary"]', { visible: true });
        // await page.click('button[class*="btn-secondary"]');

        // ACCEPT
        await page.waitForSelector('button[class*="btn-primary"]', { visible: true });
        await page.click('button[class*="btn-primary"]');

        await timeout(2000);

        if (!page.isClosed()) {
            await page.waitForSelector('button[class*="btn-primary"]', { visible: true });
            await page.click('button[class*="btn-primary"]');
        }
    },
    'permissions-connect': async (page: Page) => {
        while (!page.isClosed()) {
            await page.waitForSelector('button[class*="btn-primary"]', { visible: true });
            await page.click('button[class*="btn-primary"]');

            await timeout(2000);
        }
    },
}

export default async (browser: Browser): Promise<any> => {
    const [ error, notification ] = await to(wait([ waitForNotificationWindow(browser) ], 60000)) as [ string, Target ];
    if (error) return Promise.reject(error);

    const notification_page = await notification.page();
    if (!notification_page) return Promise.reject('Notification page not found');

    await notification_page.setViewport({ width: 357, height: 600 });

    const type = await Promise.race(
        Object.entries(markers).map(async ([ key, value ]) => {
            const div = await notification_page.waitForSelector(value, { timeout: 60000, visible: true })
                .catch(() => {});

            if (div) return Promise.resolve(key);
        })
    )

    if (!type) return Promise.reject('[ERROR] Notification type not found');

    console.log(`[INFO] Window with type "${type}" found`);

    // @ts-ignore
    return functions[type](notification_page);
}

async function waitForNotificationWindow(browser: Browser): Promise<Target> {
    while (true) {
        for (const target of browser.targets()) {
            const page = await target.page();

            if (page) {
                const body = await page.evaluate(() => document.querySelector('body[class="notification"]'));

                if (body) return target;
            }
        }
    }
}