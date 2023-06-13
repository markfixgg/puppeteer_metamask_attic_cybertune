import config from "./src/config";
import _ from 'lodash';

export const to = (promise: Promise<any>) => promise.then((data) => [ null, data ]).catch((error) => [ error ]);
export const timeout = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/**
 * Wait for promise, with maximum execution time
 * */
export const wait = (promises: Promise<any>[], milliseconds: number) => {
    return Promise.race([
        new Promise((reject) => setTimeout(() => reject('Promise execution timeout exceeded'), milliseconds)),
        ...promises,
    ])
}

export const random_delay = () => new Promise((resolve) => setTimeout(resolve, _.sample(config.DELAYS)));
