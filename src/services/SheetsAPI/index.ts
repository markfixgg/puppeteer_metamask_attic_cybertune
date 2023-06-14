import { GoogleSpreadsheet } from 'google-spreadsheet';

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
        log: async (message: string, profile_id: number, backgroundColor: { red: number; green: number; blue: number; alpha: number; }) => {
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

            if (column >= 0 && row >= 0) {
                const cell = await sheet.getCell(row, column);
                      cell.value = message;
                      cell.wrapStrategy = "WRAP";
                      cell.horizontalAlignment = "LEFT";
                      cell.backgroundColor = backgroundColor;

                await cell.save();
            }
        },
        info: async (message: string, profile_id: number)=> this.logger.log(`[INFO] [${this.logger.datetime()}]: ${message}`, profile_id, { red: 133 / 255, green: 190 / 255, blue: 114 / 255, alpha: 1 }),
        error: async (message: string, profile_id: number)=> this.logger.log(`[ERROR] [${this.logger.datetime()}]: ${message}`, profile_id, { red: 225 / 255, green: 87 / 255, blue: 91 / 255, alpha: 1 }),
        warning: async (message: string, profile_id: number)=> this.logger.log(`[WARNING] [${this.logger.datetime()}]: ${message}`, profile_id, { red: 232 / 255, green: 132 / 255, blue: 51 / 255, alpha: 1 }),
    }
}

export default new SheetsAPI();