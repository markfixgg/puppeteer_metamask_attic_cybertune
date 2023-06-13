import moment from "moment";
import path from "path";
import fs from 'fs';

class AssetsAPI {
    private readonly collections: { accounts: IJSONAccount[]; messages: string[]; completed: number[] };
    private readonly assets_folder: string;
    private readonly date: string;

    constructor() {
        this.assets_folder = path.join(__dirname, '../', '../', 'assets');

        this.date = moment().utc().format('YYYY-MM-DD');

        this.collections = {
            accounts: JSON.parse(fs.readFileSync(path.join(this.assets_folder, 'accounts.json')) as any),
            messages: JSON.parse(fs.readFileSync(path.join(this.assets_folder, 'messages.json')) as any),
            completed: []
        }

        if (!fs.existsSync(path.join(this.assets_folder, 'iterations', `${this.date}.json`))) {
            fs.writeFileSync(path.join(this.assets_folder, 'iterations', `${this.date}.json`), JSON.stringify([]))
        } else {
            this.collections.completed = JSON.parse(fs.readFileSync(path.join(this.assets_folder, 'iterations', `${this.date}.json`)) as any)
        }
    }

    messages = {
        getAll: () => this.collections.messages,
        get: () => {
            const [ message ] = this.collections.messages.slice(0, 1);

            this.collections.messages = this.collections.messages.filter((x) => x !== message);

            fs.writeFileSync(path.join(this.assets_folder, 'messages.json'), JSON.stringify(this.collections.messages, null, 2));

            return message;
        }
    }

    accounts = {
        getAll: () => this.collections.accounts,
        get: (profile_id: number) => {
            const account = this.collections.accounts.find((x) => x.id === profile_id);

            if (this.accounts.is_completed(profile_id)) return;

            if (account) {
                const message = this.messages.get();

                return { ...account, message };
            }
        },
        completed: (profile_id: number) => {
            this.collections.completed.push(profile_id);

            fs.writeFileSync(path.join(this.assets_folder, 'iterations', `${this.date}.json`), JSON.stringify([ ...new Set(this.collections.completed) ], null, 2));
        },
        is_completed: (profile_id: number): boolean => {
            return this.collections.completed.includes(profile_id);
        }
    }
}

export default new AssetsAPI();