import tape from 'tape';

import { getURL, DEFAULT_CONFIG } from '../../services/config/service';

import { runE2ETest, getPromisified } from '../../e2e-utils';

const ENDPOINT = '/';
const URL = getURL(DEFAULT_CONFIG)(ENDPOINT);

tape(ENDPOINT, (t: tape.Test) =>
  runE2ETest({})(t)((test, assets) =>
    getPromisified({
      assets,
      request: { uri: URL },
    }).then(response => {
      const EXPECTED_RETURN_CODE = 200;
      test.equals(
        response.statusCode,
        EXPECTED_RETURN_CODE,
        `status code SHOULD be ${EXPECTED_RETURN_CODE}`,
      );
      test.equals(
        typeof JSON.parse(response.body).message,
        'string',
        'SHOULD return a JSON body having a string message property',
      );
      test.deepEqual(
        JSON.parse(response.body).links,
        [
          {
            href: '/self-health/ping',
            rel: 'ping',
          },
        ],
        'SHOULD return a JSON body having a link to Self-Health Ping endpoint',
      );
      test.end();
    }),
  ),
);
