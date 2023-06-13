namespace IDolphinAPI {
    interface IResponse<Response> {
        response?: Response;
        error?: string;
    }

    interface IBrowserProfile { id: number; teamId: number; userId: number; name: string; tags: any[]; platform: string; browserType: string; mainWebsite: string; useragent: {mode: string; value: string; }; webrtc: {mode: string; ipAddress: {}; }; canvas: {mode: string; }; webgl: {mode: string; }; webglInfo: {mode: string; vendor: string; renderer: string; }; clientRect: {mode: string; }; notes: {content: {}; color: string; style: string; icon: {}; }; timezone: {mode: string; value: {}; }; locale: {mode: string; value: {}; }; tabs: (string)[]; ports: {mode: string; blacklist: string; }; proxyId: number; proxy: {id: number; name: string; type: string; host: string; savedByUser: number; cryptoKeyId: number; login: string; password: string; changeIpUrl: {}; port: string; }; access: {view: number; update: number; delete: number; share: number; usage: number; }; status: {}; geolocation: {mode: string; latitude: {}; longitude: {}; accuracy: {}; }; cpu: {mode: string; value: number; }; memory: {mode: string; value: number; }; platformName: string; cpuArchitecture: string; osVersion: string; screen: {width: {}; height: {}; mode: string; resolution: {}; }; connection: {downlink: number; effectiveType: string; rtt: number; saveData: boolean; }; vendorSub: string; productSub: string; vendor: string; product: string; doNotTrack: boolean; args: any[]; appCodeName: string; userFields: {}; updated_at: string; mediaDevices: {mode: string; audioInputs: {}; videoInputs: {}; audioOutputs: {}; }; storagePath: string; lastRunningTime: {}; lastRunnedByUserId: {}; lastRunUuid: {}; running: number; platformVersion: string; uaFullVersion: string; extensionsNewNaming: boolean; login: string; password: string; bookmarks: any[]; extensions: ({url: string; type: string; hash: string; })[]; homepages: any[]; }
    interface IBrowserProfiles { data: IBrowserProfile[] }
    interface IBrowserProfilesResponse extends IResponse<IBrowserProfiles> {}

    interface IStart { success: boolean; automation: { port: number; wsEndpoint: string; } }
    interface IStartResponse extends IResponse<IStart> {}

    interface IStop { success: boolean; }
    interface IStopResponse extends IResponse<IStop> {}
}

interface IJSONAccount {
    id: number;
    wallet: string;
    password: string;
    priority: number;
    message: string;
}