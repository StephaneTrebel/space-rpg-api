import { get, RequestResponse, post } from 'request';
import tape from 'tape';

import { main } from '../src/index';

import { spawnAPIBackend } from './services/openapi-backend/service';
import { State } from './services/state/types';
import { spawnWebServer } from './services/webserver/service';
import { ActionList } from './services/time/types';
import { Config } from './services/config/types';
import { DEFAULT_CONFIG } from './services/config/service';

type RunE2ETest = (params: {
  config?: Config;
  initialActionQueue?: ActionList;
  initialState?: State;
}) => (
  test: tape.Test,
) => (testCase: (test: tape.Test) => Promise<any>) => Promise<void>;
export const runE2ETest: RunE2ETest = ({
  config,
  initialActionQueue,
  initialState,
}) => test => testCase =>
  main({ initialActionQueue, initialState, spawnAPIBackend, spawnWebServer })({
    config: config || DEFAULT_CONFIG,
    startTime: true,
  })().then(assets =>
    testCase(test).finally(() => {
      assets.teardown();
      assets.server.close();
    }),
  );

interface Headers {
  authorization: string;
}

interface GetRequest {
  headers?: Headers;
  qs?: { [key: string]: string };
  uri: string;
}

export const getPromisified = (
  request: GetRequest,
): Promise<RequestResponse> => {
  return new Promise((resolve, reject) =>
    get(request, (error, response) =>
      error ? /* istanbul ignore next */ reject(error) : resolve(response),
    ),
  );
};
export interface PostOptions {
  body?: any;
  json?: boolean;
  headers?: Headers;
  url: string;
}

export const POST_OPTIONS_STUB = { body: '', headers: {} };

export const postPromisified = (
  options: PostOptions,
): Promise<RequestResponse> =>
  new Promise((resolve, reject) =>
    post(options, (error, response) =>
      error ? reject(error) : resolve(response),
    ),
  );

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
