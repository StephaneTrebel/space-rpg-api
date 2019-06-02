import tape from 'tape';

import { runE2ETest, getPromisified } from '../../../e2e-utils';

const ENDPOINT = '/self-health/ping';
tape(ENDPOINT, (t: tape.Test) =>
  runE2ETest({})(t)((test, assets) =>
    getPromisified({
      assets,
      request: { uri: 'http://127.0.0.1:9000/self-health/ping' },
    }).then(response => {
      const MESSAGE = 'pong';
      const EXPECTED_RETURN_CODE = 200;
      test.equals(
        response.statusCode,
        EXPECTED_RETURN_CODE,
        `status code SHOULD be ${EXPECTED_RETURN_CODE}`,
      );
      test.equals(
        JSON.parse(response.body).message,
        MESSAGE,
        `SHOULD return an object having a message property with "${MESSAGE}"`,
      );
      return test.end();
    }),
  ),
);
