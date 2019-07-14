import tape from 'tape';

import { runE2ETest, postPromisified } from '../../../e2e-utils';

import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';

import { SELF_HEALTH_LINK } from '../../miscellaneous/self-health/handler';

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
				test.plan(1);
				const EXPECTED_RETURN_CODE = 400;
				test.equal(
					response.statusCode,
					EXPECTED_RETURN_CODE,
					`SHOULD return a ${EXPECTED_RETURN_CODE} response`,
				);
				test.end();
			}),
		),
	);
	subTest.test('WHEN request has a valid body', (t: tape.Test) => {
		const MOCK_NAME = 'mock_name';
		runE2ETest({})(t)((test, assets) =>
			postPromisified({
				assets,
				body: { name: MOCK_NAME },
				json: true,
				url: URL,
			}).then(response => {
				test.plan(5);
				const EXPECTED_RETURN_CODE = 201;
				test.equal(
					response.statusCode,
					EXPECTED_RETURN_CODE,
					`SHOULD return a ${EXPECTED_RETURN_CODE} response`,
				);
				test.deepEqual(
					response.body.player.currentPosition,
					{ x: 0, y: 0, z: 0 },
					'SHOULD return a player having the expected starting position',
				);
				test.equal(
					typeof response.body.player.id,
					'string',
					'SHOULD return a player having a string id',
				);
				test.equal(
					response.body.player.name,
					MOCK_NAME,
					'SHOULD return a player having the expected name',
				);
				test.deepEqual(
					response.body.links,
					[SELF_HEALTH_LINK],
					'SHOULD return a JSON body having a link to Self-Health Ping endpoint',
				);
				test.end();
			}),
		);
	});
});
