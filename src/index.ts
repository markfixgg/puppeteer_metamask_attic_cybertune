import { timeout, random_delay } from "../utils";

import DolphinAPI from "./services/DolphinAPI";

import assetsAPI from "./services/AssetsAPI";
import sheetsAPI from "./services/SheetsAPI";

import puppeteer from "puppeteer";
import flows from "./flows";

const bootstrap = async () => {
    const accounts = assetsAPI.accounts.getAll()
        // Shuffle array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
        // Sort by priority (ascending)
        .sort((a, b) => a.priority - b.priority)
        // Reverse array, to be descending (priority profiles will be first)
        .reverse();

    console.log(`Loaded ${accounts.length} profiles.`);

    for (const account of accounts) {
        const profile = assetsAPI.accounts.get(account.id);
        if (!profile) return sheetsAPI.logger.warning(`Profile not correctly configured, or already completed`, account.id);

        await process_profile(profile)
            .then(() => {
                assetsAPI.accounts.completed(profile.id);

                sheetsAPI.logger.info(`Account [${profile.name}] successfully done`, profile.id);
            })
            .catch((error) => sheetsAPI.logger.error(error.message, profile.id))
    }
}

async function process_profile(profile: IJSONAccount) {
    const api = new DolphinAPI();

    const { error, response } = await api.start(profile.id);
    if (error) console.error(error);

    if (!response || !response.success) return sheetsAPI.logger.error(`Profile failed to start the browser`, profile.id);

    const { port, wsEndpoint } = response.automation;

    const browser = await puppeteer.connect({
        browserWSEndpoint: `ws://127.0.0.1:${port}${wsEndpoint}`,
        defaultViewport: { width: 1920, height: 1080 },
        slowMo: 30
    });

    // Close all tabs, leave only working one
    let [ page, ...pages ] = await browser.pages();
    if (!page) page = await browser.newPage();

    if (pages.length) {
        await Promise.all(pages.map((page) => page.close()))
    }

    // Authorize to metamask wallet
    await flows.metamask.authorization(browser, page, profile)
        .then(() => sheetsAPI.logger.info('Authorization to metamask successfully', profile.id))
        .catch(() => sheetsAPI.logger.error('Failed authorize to metamask', profile.id));

    const blocks = { atticc: flows.sites.atticc, cybertune: flows.sites.cybertune };

    for (const [ site, flow ] of Object.entries(blocks)) {
        await flow(browser, profile)
            .then(() => sheetsAPI.logger.info(`Block "${site}" done`, profile.id))
            .catch((error) => {
                console.error(`[ERROR] ${error.message}`);

                sheetsAPI.logger.info(`Error happened in block "${site}"`, profile.id)
            })

        await timeout(5000);
    }

    /**
     * Link3To always latest
     */
    await flows.sites.link3to(browser, profile)
        .then(() => sheetsAPI.logger.info(`Block "link3to" done`, profile.id))
        .catch((error) => {
            console.error(`[ERROR] ${error.message}`);

            sheetsAPI.logger.info(`Error happened in block "link3to"`, profile.id)
        });

    await api.stop(profile.id);
}

export default bootstrap;