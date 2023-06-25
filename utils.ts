import config from "./src/config";
import _ from 'lodash';

export const to = (promise: Promise<any>) => promise.then((data) => [ null, data ]).catch((error) => [ error ]);
export const timeout = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/**
 * Wait for promise, with maximum execution time
 * */
export const wait = (promises: Promise<any>[], milliseconds: number) => {
    const timeout = new Promise<string>((resolve, reject) => setTimeout(reject, milliseconds, 'Promise execution timeout exceeded'));

    return Promise.race([ ...promises, timeout ]);
}

export const random_delay = () => new Promise((resolve) => setTimeout(resolve, _.sample(config.DELAYS)));
