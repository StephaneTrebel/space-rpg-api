import tape from 'tape';

import { getURL, DEFAULT_CONFIG } from '../../services/config/service';

import { runE2ETest, getPromisified } from '../../e2e-utils';

import { SWAGGER_UI_LINK } from '../../services/openapi-backend/service';
import { SPECIFICATION_LINK } from '../../handlers/miscellaneous/specification/handler';
import { SELF_HEALTH_LINK } from '../miscellaneous/self-health/handler';
import { VERSIONS_LINK } from '../miscellaneous/versions/handler';

const ENDPOINT = '/';
const URL = getURL(DEFAULT_CONFIG)(ENDPOINT);

tape(
	`${ENDPOINT}
	GIVEN a request`,
	(test: tape.Test) => {
		test.plan(3);
		return runE2ETest({})(test)((t, assets) =>
			getPromisified({
				assets,
				request: { uri: URL },
			}).then(response => {
				const EXPECTED_RETURN_CODE = 200;
				t.equals(
					response.statusCode,
					EXPECTED_RETURN_CODE,
					`status code SHOULD be ${EXPECTED_RETURN_CODE}`,
				);
				t.equals(
					typeof JSON.parse(response.body).text,
					'string',
					'SHOULD return a JSON body having a string text property',
				);
				t.deepEqual(
					JSON.parse(response.body).links,
					[
						SELF_HEALTH_LINK,
						SPECIFICATION_LINK,
						SWAGGER_UI_LINK,
						VERSIONS_LINK,
					],
					'SHOULD return a JSON body having a link to various endpoints',
				);
				t.end();
			}),
		);
	},
);

tape(
	`GIVEN a request to an unknown URL`,
	(test: tape.Test) => {
		test.plan(1);
		return runE2ETest({})(test)((t, assets) =>
			getPromisified({
				assets,
				request: { uri: getURL(DEFAULT_CONFIG)('/LOLNOPE') },
			})
				.then(response => {
					const EXPECTED_RETURN_CODE = 404;
					t.equals(
						response.statusCode,
						EXPECTED_RETURN_CODE,
						`status code SHOULD be ${EXPECTED_RETURN_CODE}`,
					);
					t.end();
				})
				.catch(error => {
					console.log(error.text);
					t.end();
				}),
		);
	},
);
