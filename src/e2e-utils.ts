import { get, RequestResponse, post } from 'request';
import tape from 'tape';

import { main } from './main/main';
import { MainAssets } from './main/types';

import { DEFAULT_CONFIG } from './services/config/service';
import { Config } from './services/config/types';
import { spawnAPIBackend } from './services/openapi-backend/service';
import { State } from './services/state/types';
import { ActionList } from './services/time/types';
import { spawnWebServer } from './services/webserver/service';
import { EMPTY_STATE } from './services/state/service';

type RunE2ETest = (params: {
	config?: Config;
	initialActionQueue?: ActionList;
	initialState?: State;
}) => (
	test: tape.Test,
) => (
	testCase: (test: tape.Test, assets: MainAssets) => Promise<any>,
) => Promise<void>;
export const runE2ETest: RunE2ETest = ({
	config,
	initialActionQueue,
	initialState = EMPTY_STATE,
}) => test => testCase =>
	main({ initialActionQueue, initialState, spawnAPIBackend, spawnWebServer })({
		config: config || DEFAULT_CONFIG,
		startTime: true,
	}).then(assets => {
		const teardown = () => {
			assets.loggerService.debug('Stopping the test…');
			assets.teardown();
		};
		assets.loggerService.info('Test started…');
		return testCase(test, assets)
			.then(() => {
				assets.loggerService.debug('Test finished successfully');
				return teardown();
			})
			.catch(error => {
				assets.loggerService.error(error.message);
				assets.loggerService.debug('Test crashed :(');
				return teardown();
			});
	});

interface Headers {
	authorization: string;
}

type GetPromisified = (params: {
	assets: MainAssets;
	request: {
		headers?: Headers;
		qs?: { [key: string]: string };
		uri: string;
	};
}) => Promise<RequestResponse>;
export const getPromisified: GetPromisified = ({ assets, request }) => {
	assets.loggerService.info(`Emitting a GET request on '${request.uri}'`);
	return new Promise((resolve, reject) =>
		get(request, (error, response) =>
			error ? /* istanbul ignore next */ reject(error) : resolve(response),
		),
	);
};

export const POST_OPTIONS_STUB = { body: '', headers: {} };

type PostPromisified = (options: {
	assets: MainAssets;
	body?: any;
	json?: boolean;
	headers?: Headers;
	url: string;
}) => Promise<RequestResponse>;
export const postPromisified: PostPromisified = options => {
	options.assets.loggerService.info(
		`Emitting a GET request on '${options.url}'`,
	);
	return new Promise((resolve, reject) =>
		post(options, (error, response) =>
			error ? reject(error) : resolve(response),
		),
	);
};

export const setTimeoutPromisifed = <T>(
	fn: () => Promise<T>,
	timeout: number,
) =>
	new Promise<T>((resolve, reject) => {
		try {
			setTimeout(() => {
				try {
					resolve(fn());
				} catch (error) {
					reject(error);
				}
			}, timeout);
		} catch (error) {
			reject(error);
		}
	});
