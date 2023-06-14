import { GoogleSpreadsheet } from 'google-spreadsheet';

import Color from 'color';

import service_account from '../../config/service_account.json';
import assetsAPI from "../AssetsAPI";
import config from "../../config";
import moment from "moment";

class SheetsAPI {
    private readonly document: GoogleSpreadsheet;
    private readonly accounts: IJSONAccount[];
    private readonly date: string;

    constructor() {
        this.date = moment().utc().format('YYYY-MM-DD');

        this.accounts = assetsAPI.accounts.getAll();
        this.document = new GoogleSpreadsheet(config.SHEET_ID);
    }

    async authorization() {
        await this.document.useServiceAccountAuth({
            client_email: service_account.client_email,
            private_key: service_account.private_key,
        });

        return this.document.loadInfo();
    }

    async get_sheet() {
        let sheet = await this.document.sheetsByTitle[this.date];
        if (!sheet) sheet = await this.document.addSheet({ title: this.date });

        await sheet.resize({ rowCount: 500, columnCount: 500 });

        await sheet.setHeaderRow(this.accounts.map((account) => `${account.name} | ID: [${account.id}]`));

        await sheet.loadCells();

        for (let i = 0; i < 200; i++) {
            const cell = await sheet.getCell(0, i);

            if (cell.formattedValue) cell.horizontalAlignment = "LEFT";
        }

        await sheet.saveUpdatedCells()

        return sheet;
    }

    logger = {
        datetime: () => moment().utc().format('YYYY-MM-DD HH:mm:ss'),
        log: async (message: string, profile_id: number, color: string) => {
            const sheet = await this.get_sheet();
            const account = this.accounts.find((x) => x.id === profile_id) || {} as IJSONAccount;

            const column = sheet.headerValues.indexOf(`${account.name} | ID: [${account.id}]`);
            const row = await (async (): Promise<number> => {
                for (let i = 0; i < 1000; i++) {
                    const row = sheet.getCell(i, column);

                    if (!row.value && !row.formattedValue) return i;
                }

                return -1;
            })();

            const { red, green, blue, alpha } = await (async () => {
                const { r: red, g: green, b: blue, alpha = 1 } = Color(color).object() || {};

                return { red, green, blue, alpha };
            })().catch(() => ({ red: 255, green: 255, blue: 255, alpha: 1 }));

            if (column >= 0 && row >= 0) {
                const cell = await sheet.getCell(row, column);
                      cell.value = message;
                      cell.wrapStrategy = "WRAP";
                      cell.horizontalAlignment = "LEFT";
                      cell.backgroundColor = { red: red / 255, green: green / 255, blue: blue / 255, alpha };

                await cell.save();
            }
        },
        info: async (message: string, profile_id: number)=> this.logger.log(`[INFO] [${this.logger.datetime()}]: ${message}`, profile_id, 'green'),
        error: async (message: string, profile_id: number)=> this.logger.log(`[ERROR] [${this.logger.datetime()}]: ${message}`, profile_id, 'orange'),
        warning: async (message: string, profile_id: number)=> this.logger.log(`[WARNING] [${this.logger.datetime()}]: ${message}`, profile_id, 'red'),
    }
}

export default new SheetsAPI();