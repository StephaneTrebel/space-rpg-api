import { get, RequestResponse, post } from 'request';
import tape from 'tape';

import { main } from '../src/index';

import { spawnAPIBackend } from './services/openapi-backend/service';
import { State } from './services/state/types';
import { spawnWebServer } from './services/webserver/service';
import { ActionList } from './services/time/types';

export const runE2ETest = ({
  initialActionQueue,
  initialState,
}: { initialState?: State; initialActionQueue?: ActionList } = {}) => (
  test: tape.Test,
) => (testCase: (test: tape.Test) => any) =>
  main({ initialActionQueue, initialState, spawnAPIBackend, spawnWebServer })({
    config: {
      logger: { nolog: true },
    },
    startTime: true,
  })().then((server: any) => {
    return testCase(test).finally(() => server.close());
  });

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
