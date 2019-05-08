import cors from 'cors';
import express from 'express';
import { OpenAPIBackend } from 'openapi-backend/backend';
import { get, RequestResponse, post } from 'request';
import tape from 'tape';

import { main } from '../src/index';

import { spawnAPIBackend } from './services/openapi-backend/openapi-backend';
import { spawnWebServer } from './services/webserver/webserver';

export const runE2ETest = (test: tape.Test) => (
  testCase: (test: tape.Test) => any,
) =>
  main({
    backendEngine: OpenAPIBackend,
    cors,
    express,
    spawnAPIBackend,
    spawnWebServer,
  }).then((server: any) => {
    return testCase(test).finally(() => server.close());
  });

// to avoid { '0': { Error: self signed certificate code: 'DEPTH_ZERO_SELF_SIGNED_CERT' } }
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
