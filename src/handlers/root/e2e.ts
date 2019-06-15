import tape from 'tape';

import { getURL, DEFAULT_CONFIG } from '../../services/config/service';

import { runE2ETest, getPromisified } from '../../e2e-utils';

import { SELF_HEALTH_LINK } from '../miscellaneous/self-health/handler';

const ENDPOINT = '/';
const URL = getURL(DEFAULT_CONFIG)(ENDPOINT);

tape(ENDPOINT, (cases: tape.Test) => {
  cases.test(ENDPOINT, (t: tape.Test) => {
    t.plan(3);
    return runE2ETest({})(t)((test, assets) =>
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
          [SELF_HEALTH_LINK],
          'SHOULD return a JSON body having a link to Self-Health Ping endpoint',
        );
        test.end();
      }),
    );
  });

  cases.test('404 Error handling', (t: tape.Test) => {
    t.plan(1);
    return runE2ETest({})(t)((test, assets) =>
      getPromisified({
        assets,
        request: { uri: getURL(DEFAULT_CONFIG)('/LOLNOPE') },
      })
        .then(response => {
          const EXPECTED_RETURN_CODE = 404;
          test.equals(
            response.statusCode,
            EXPECTED_RETURN_CODE,
            `status code SHOULD be ${EXPECTED_RETURN_CODE}`,
          );
          test.end();
        })
        .catch(error => {
          console.log(error.message);
          test.end();
        }),
    );
  });
});
