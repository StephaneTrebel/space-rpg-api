import tape from 'tape';

import { runE2ETest, getPromisified } from '../../../e2e-utils';

import { DEFAULT_CONFIG, getURL } from '../../../services/config/service';

const ENDPOINT = '/self-health/ping';
const URL = getURL(DEFAULT_CONFIG)(ENDPOINT);

tape(ENDPOINT, (t: tape.Test) =>
  runE2ETest({})(t)((test, assets) =>
    getPromisified({
      assets,
      request: { uri: URL },
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
