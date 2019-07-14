import tape from 'tape';

import { runE2ETest, postPromisified } from '../../../e2e-utils';

import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';
import { EMPTY_STATE } from '../../../services/state/service';

import { createEntity } from '../../../utils/entity/utils';
import { EntityType } from '../../../utils/entity/types';

const ENDPOINT = '/displacement/travelToEntity';
const URL = getURL(DEFAULT_CONFIG)(ENDPOINT);

tape(ENDPOINT, (subTest: tape.Test) => {
	subTest.test('WHEN request has an invalid body', (caseTest: tape.Test) => {
		return runE2ETest({})(caseTest)((test, assets) =>
			postPromisified({
				assets,
				body: '',
				url: URL,
			}).then(response => {
				test.plan(1);
				const EXPECTED_RETURN_CODE = 400;
				test.equals(
					response.statusCode,
					EXPECTED_RETURN_CODE,
					`status code SHOULD be ${EXPECTED_RETURN_CODE}`,
				);
				test.end();
			}),
		);
	});

	subTest.test('GIVEN two existing entities', (givenClause: tape.Test) => {
		givenClause.test(
			'WHEN request has a valid body referencing both entities as source and target',
			(caseTest: tape.Test) => {
				const source = createEntity(EntityType.SPACESHIP)({
					id: `${ENDPOINT} Success Source`,
				});
				const target = createEntity(EntityType.PLANET)({
					id: `${ENDPOINT} Success Target`,
				});
				return runE2ETest({
					initialState: {
						...EMPTY_STATE,
						entityList: [source, target],
					},
				})(caseTest)((test, assets) =>
					postPromisified({
						assets,
						body: { entityId: source.id, targetId: target.id },
						json: true,
						url: URL,
					}).then(response => {
						test.plan(3);
						const EXPECTED_RETURN_CODE = 201;
						test.equals(
							response.statusCode,
							EXPECTED_RETURN_CODE,
							`SHOULD return a ${EXPECTED_RETURN_CODE} response`,
						);
						test.equals(
							typeof response.body.displacementId,
							'string',
							'SHOULD return a JSON body having a string id property',
						);
						test.deepEqual(
							response.body.links,
							[
								{
									href: `/displacement/${response.body.displacementId}`,
									rel: 'details',
								},
							],
							'SHOULD return a JSON body having a link to GET Displacement endpoint',
						);
						test.end();
					}),
				);
			},
		);
	});
});
