import tape from 'tape';

import { runE2ETest, postPromisified } from '../../../e2e-utils';
import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';

const ENDPOINT = '/player/create';
const URL = getURL(DEFAULT_CONFIG)(ENDPOINT);

tape(ENDPOINT, (subTest: tape.Test) => {
  subTest.test('WHEN request has an invalid body', (t: tape.Test) =>
    runE2ETest({})(t)((test, assets) =>
      postPromisified({
        assets,
        body: '',
        url: URL,
      }).then(response => {
        const EXPECTED_RETURN_CODE = 400;
        test.equals(
          response.statusCode,
          EXPECTED_RETURN_CODE,
          `status code SHOULD be ${EXPECTED_RETURN_CODE}`,
        );
        test.end();
      }),
    ),
  );
  subTest.test('WHEN request has a valid body', (t: tape.Test) => {
    const MOCK_USERNAME = 'mock_username';
    runE2ETest({})(t)((test, assets) =>
      postPromisified({
        assets,
        body: { username: MOCK_USERNAME },
        json: true,
        url: URL,
      }).then(response => {
        const EXPECTED_RETURN_CODE = 201;
        test.equals(
          response.statusCode,
          EXPECTED_RETURN_CODE,
          `status code SHOULD be ${EXPECTED_RETURN_CODE}`,
        );
        test.equals(
          response.body.username,
          MOCK_USERNAME,
          'SHOULD return a JSON body having the expected username property',
        );
        test.deepEqual(
          response.body.links,
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
    );
  });
});
