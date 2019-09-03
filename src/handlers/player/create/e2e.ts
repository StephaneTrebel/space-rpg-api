import tape from 'tape';

import { runE2ETest, postPromisified } from '../../../e2e-utils';

import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';

import { SELF_HEALTH_LINK } from '../../miscellaneous/self-health/handler';

const ENDPOINT = '/player/create';
const URL = getURL(DEFAULT_CONFIG)(ENDPOINT);

tape(
	`${ENDPOINT}
	WHEN request has an invalid body`,
	(test: tape.Test) => {
		runE2ETest({})(test)((t, assets) =>
			postPromisified({
				assets,
				body: '',
				url: URL,
			}).then(response => {
				t.plan(1);
				const EXPECTED_RETURN_CODE = 400;
				t.equal(
					response.statusCode,
					EXPECTED_RETURN_CODE,
					`SHOULD return a ${EXPECTED_RETURN_CODE} response`,
				);
				t.end();
			}),
		);
	},
);

tape(
	`${ENDPOINT}
	WHEN request has a valid body`,
	(test: tape.Test) => {
		const MOCK_NAME = 'mock_name';
		runE2ETest({})(test)((t, assets) =>
			postPromisified({
				assets,
				body: { name: MOCK_NAME },
				json: true,
				url: URL,
			}).then(response => {
				t.plan(6);
				const EXPECTED_RETURN_CODE = 201;
				t.equal(
					response.statusCode,
					EXPECTED_RETURN_CODE,
					`SHOULD return a ${EXPECTED_RETURN_CODE} response`,
				);
				t.deepEqual(
					response.body.player.currentPosition,
					{ x: 0, y: 0, z: 0 },
					'SHOULD return a player having the expected starting position',
				);
				t.equal(
					typeof response.body.player.id,
					'string',
					'SHOULD return a player having a string id',
				);
				t.equal(
					response.body.player.name,
					MOCK_NAME,
					'SHOULD return a player having the expected name',
				);
				t.equal(
					typeof response.body.text,
					'string',
					'SHOULD return a descriptive text',
				);
				t.deepEqual(
					response.body.links,
					[SELF_HEALTH_LINK],
					'SHOULD return a JSON body having a link to Self-Health Ping endpoint',
				);
				t.end();
			}),
		);
	},
);
