import { AxiosInstance } from 'axios';
import { to } from "../../../utils";

import config from "../../config";
import axios from "axios";

class DolphinAPI {
    private readonly remote: AxiosInstance;
    private readonly local: AxiosInstance;

    constructor() {
        this.remote = axios.create({
            baseURL: "https://dolphin-anty-api.com/",
            headers: {
                'Authorization': `Bearer ${config.DOLPHIN_BEARER}`
            }
        });

        this.local = axios.create({
            baseURL: "http://localhost:3001/"
        });
    }

    async profiles(): Promise<IDolphinAPI.IBrowserProfilesResponse> {
        const [ error, response = {} ] = await to(this.remote.get('browser_profiles'));
        if (error) return { error: error.message };

        return { response: response.data || {} };
    }

    async start(profile_id: number): Promise<IDolphinAPI.IStartResponse> {
        const [ error, response = {} ] = await to(this.local.get(`v1.0/browser_profiles/${profile_id}/start`, { params: { automation: 1 } }));
        if (error) return { error: error.message };

        return { response: response.data || {} };
    }

    async stop(profile_id: number): Promise<IDolphinAPI.IStopResponse> {
        const [ error, response = {} ] = await to(this.local.get(`v1.0/browser_profiles/${profile_id}/stop`));
        if (error) return { error: error.message };

        return { response: response.data || {} };
    }

}

export default DolphinAPI;