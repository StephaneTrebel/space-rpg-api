import tape from 'tape';

import { getURL, DEFAULT_CONFIG } from '../../services/config/service';

import { runE2ETest, getPromisified } from '../../e2e-utils';

import { SELF_HEALTH_LINK } from '../miscellaneous/self-health/handler';
import { ROOT_LINK } from '../root/handler';

const ENDPOINT = '/specification';
const URL = getURL(DEFAULT_CONFIG)(ENDPOINT);

tape(ENDPOINT, (t: tape.Test) =>
  runE2ETest({
  })(t)((test, assets) =>
    getPromisified({
      assets,
      request: { uri: URL },
    }).then(response => {
      const EXPECTED_RETURN_CODE = 200;
      test.equals(
        response.statusCode,
        EXPECTED_RETURN_CODE,
        `SHOULD return a ${EXPECTED_RETURN_CODE} response`,
      );
      test.equals(
        JSON.parse(response.body).specification.openapi,
        '3.0.0',
        'SHOULD return a JSON body having an OpenAPI specification',
      );
      test.deepEqual(
        JSON.parse(response.body).links,
        [ROOT_LINK, SELF_HEALTH_LINK],
        'SHOULD return a JSON body having expected links',
      );
      test.end();
    }),
  ),
);
