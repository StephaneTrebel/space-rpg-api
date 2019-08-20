import tape from 'tape';

import { runE2ETest, postPromisified } from '../../../e2e-utils';

import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';
import { EMPTY_STATE } from '../../../services/state/service';

import { createDisplacementMock } from '../../../utils/displacememt/utils';
import { Id } from '../../../utils/id/types';
import { Position } from '../../../utils/position/types';
import { createSpaceship } from "../../../utils/spaceship/utils";

const ENDPOINT = '/displacement/travelToPosition';
const URL = getURL(DEFAULT_CONFIG)(ENDPOINT);

tape(ENDPOINT, (given: tape.Test) => {
	given.test('GIVEN an invalid body', (caseTest: tape.Test) => {
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
					`SHOULD return a ${EXPECTED_RETURN_CODE} response`,
				);
				test.end();
			}),
		);
	});

	given.test(
		`GIVEN an existing entity
    AND this entity does not already have a registered action`,
		(when: tape.Test) => {
			when.test(
				'WHEN request has a valid body referencing this entity',
				(caseTest: tape.Test) => {
					const entityId: Id = `${ENDPOINT} Success`;
					const targetCoordinates: Position = { x: 0, y: 0, z: 0 };
					return runE2ETest({
						initialState: {
							...EMPTY_STATE,
							entityList: [createSpaceship({ id: entityId })],
						},
					})(caseTest)((test, assets) =>
						postPromisified({
							assets,
							body: { entityId, targetCoordinates },
							json: true,
							url: URL,
						}).then(response => {
							test.plan(3);
							const EXPECTED_RETURN_CODE = 201;
							test.equals(
								response.statusCode,
								EXPECTED_RETURN_CODE,
								`status code SHOULD be ${EXPECTED_RETURN_CODE}`,
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
		},
	);

	given.test(
		`GIVEN an existing entity
    AND this entity already has a registered action`,
		(when: tape.Test) => {
			when.test(
				'WHEN request has a valid body referencing this entity',
				(caseTest: tape.Test) => {
					const entityId: Id = `${ENDPOINT} Success`;
					const targetCoordinates: Position = { x: 0, y: 0, z: 0 };
					return runE2ETest({
						initialActionQueue: [createDisplacementMock({ entityId })],
						initialState: {
							...EMPTY_STATE,
							entityList: [createSpaceship({ id: entityId })],
						},
					})(caseTest)((test, assets) =>
						postPromisified({
							assets,
							body: { entityId, targetCoordinates },
							json: true,
							url: URL,
						}).then(response => {
							test.plan(3);
							const EXPECTED_RETURN_CODE = 201;
							test.equals(
								response.statusCode,
								EXPECTED_RETURN_CODE,
								`status code SHOULD be ${EXPECTED_RETURN_CODE}`,
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
		},
	);
});
