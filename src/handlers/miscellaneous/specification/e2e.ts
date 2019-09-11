import tape from 'tape';

import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';

import { runE2ETest, getPromisified } from '../../../e2e-utils';

const ENDPOINT = '/specification';
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
				`SHOULD return a ${EXPECTED_RETURN_CODE} response`,
			);
			test.equal(
				JSON.parse(response.body).openapi,
				'3.0.0',
				'SHOULD return a JSON body having an OpenAPI specification',
			);
			test.equal(
				JSON.parse(response.body).links,
				undefined,
				'SHOULD return a JSON body not having any link',
			);
			test.end();
		}),
	),
);
