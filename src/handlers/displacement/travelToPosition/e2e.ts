import tape from 'tape';

import { runE2ETest, postPromisified } from '../../../e2e-utils';

import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';
import { EMPTY_STATE } from '../../../services/state/service';

import { createDisplacementMock } from '../../../utils/displacememt/utils';
import { Id } from '../../../utils/id/types';
import { Position } from '../../../utils/position/types';
import { createSpaceship } from '../../../utils/spaceship/utils';

const ENDPOINT = '/displacement/travelToPosition';
const URL = getURL(DEFAULT_CONFIG)(ENDPOINT);

tape(
	`${ENDPOINT}
	GIVEN an invalid body`,
	(test: tape.Test) => {
		return runE2ETest({})(test)((t, assets) =>
			postPromisified({
				assets,
				body: '',
				url: URL,
			}).then(response => {
				t.plan(1);
				const EXPECTED_RETURN_CODE = 400;
				t.equals(
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
	GIVEN an existing entity
	AND this entity does not already have a registered action
	WHEN request has a valid body referencing this entity`,
	(test: tape.Test) => {
		const entityId: Id = `${ENDPOINT} Success`;
		const targetCoordinates: Position = { x: 0, y: 0, z: 0 };
		return runE2ETest({
			initialState: {
				...EMPTY_STATE,
				entityList: [createSpaceship({ id: entityId })],
			},
		})(test)((t, assets) =>
			postPromisified({
				assets,
				body: { entityId, targetCoordinates },
				json: true,
				url: URL,
			}).then(response => {
				t.plan(3);
				const EXPECTED_RETURN_CODE = 201;
				t.equals(
					response.statusCode,
					EXPECTED_RETURN_CODE,
					`status code SHOULD be ${EXPECTED_RETURN_CODE}`,
				);
				t.equals(
					typeof response.body.displacementId,
					'string',
					'SHOULD return a JSON body having a string id property',
				);
				t.deepEqual(
					response.body.links,
					[
						{
							href: `/displacement/${response.body.displacementId}`,
							rel: 'details',
						},
					],
					'SHOULD return a JSON body having a link to GET Displacement endpoint',
				);
				t.end();
			}),
		);
	},
);

tape(
	`${ENDPOINT}
	GIVEN an existing entity
	AND this entity already has a registered action
	WHEN request has a valid body referencing this entity`,
	(test: tape.Test) => {
		const entityId: Id = `${ENDPOINT} Success`;
		const targetCoordinates: Position = { x: 0, y: 0, z: 0 };
		return runE2ETest({
			initialActionQueue: [createDisplacementMock({ entityId })],
			initialState: {
				...EMPTY_STATE,
				entityList: [createSpaceship({ id: entityId })],
			},
		})(test)((t, assets) =>
			postPromisified({
				assets,
				body: { entityId, targetCoordinates },
				json: true,
				url: URL,
			}).then(response => {
				t.plan(4);
				const EXPECTED_RETURN_CODE = 201;
				const body = response.body;
				t.equals(
					response.statusCode,
					EXPECTED_RETURN_CODE,
					`status code SHOULD be ${EXPECTED_RETURN_CODE}`,
				);
				t.equals(
					typeof body.displacementId,
					'string',
					'SHOULD return a JSON body having a string id property',
				);
				t.deepEqual(
					body.links,
					[
						{
							href: `/displacement/${response.body.displacementId}`,
							rel: 'details',
						},
					],
					'SHOULD return a JSON body having a link to GET Displacement endpoint',
				);
				t.equal(typeof body.text, 'string', 'SHOULD return a descriptive text');
				t.end();
			}),
		);
	},
);
