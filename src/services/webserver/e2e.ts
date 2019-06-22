import tape from 'tape';

import { getURL, DEFAULT_CONFIG } from '../config/service';

import { runE2ETest, getPromisified } from '../../e2e-utils';

import { swaggerUIEndpoint } from './service';

const SWAGGER_UI_BASE_ENDPOINT = swaggerUIEndpoint + '/';
tape(SWAGGER_UI_BASE_ENDPOINT, (t: tape.Test) => {
  t.plan(2);
  return runE2ETest({})(t)((test, assets) =>
    getPromisified({
      assets,
      request: { uri: getURL(DEFAULT_CONFIG)(SWAGGER_UI_BASE_ENDPOINT) },
    }).then(response => {
      const EXPECTED_RETURN_CODE = 200;
      test.equals(
        response.statusCode,
        EXPECTED_RETURN_CODE,
        `SHOULD return a ${EXPECTED_RETURN_CODE} response`,
      );
      test.equal(
        (response.body as string).includes('Swagger UI'),
        true,
        'SHOULD return a JSON body having the SwaggerUI page',
      );
      test.end();
    }),
  );
});

const SWAGGER_UI_INDEX_ENDPOINT = swaggerUIEndpoint + '/index.html';
tape(SWAGGER_UI_INDEX_ENDPOINT, (t: tape.Test) => {
  t.plan(2);
  return runE2ETest({})(t)((test, assets) =>
    getPromisified({
      assets,
      request: { uri: getURL(DEFAULT_CONFIG)(SWAGGER_UI_INDEX_ENDPOINT) },
    }).then(response => {
      const EXPECTED_RETURN_CODE = 200;
      test.equals(
        response.statusCode,
        EXPECTED_RETURN_CODE,
        `SHOULD return a ${EXPECTED_RETURN_CODE} response`,
      );
      test.equal(
        (response.body as string).includes('Swagger UI'),
        true,
        'SHOULD return a JSON body having the SwaggerUI page',
      );
      test.end();
    }),
  );
});
