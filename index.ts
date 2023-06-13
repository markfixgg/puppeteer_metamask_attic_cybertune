import assetsAPI from "./src/services/AssetsAPI";
import sheetsAPI from "./src/services/SheetsAPI";

import bootstrap from "./src";
import config from "./src/config";

(async () => {
    const accounts = assetsAPI.accounts.getAll();
    const messages = assetsAPI.messages.getAll();

    console.log(`[INFO] Loaded: ${messages.length} messages | ${accounts.length} accounts`);

    if (config.CHECK_AMOUNT_OF_AVAILABLE_MESSAGE) {
        if (messages.length < accounts.length) return console.log("[ERROR] Amount of messages must be greater or equal to number of accounts")
    }

    // Authorization to table
    await sheetsAPI.authorization();

    // Run script
    await bootstrap();
})()