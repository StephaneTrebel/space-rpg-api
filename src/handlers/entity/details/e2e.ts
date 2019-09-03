import tape from 'tape';

import { getPromisified, runE2ETest } from '../../../e2e-utils';

import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';
import { EMPTY_STATE } from '../../../services/state/service';

import { Id } from '../../../utils/id/types';

import { createEntity } from '../../../utils/entity/utils';
import { EntityType } from '../../../utils/entity/types';

const BASE_ENDPOINT = '/entity';
const URL = (id: Id) => getURL(DEFAULT_CONFIG)(`${BASE_ENDPOINT}/${id}`);
const ENDPOINT = `${BASE_ENDPOINT}/:id`;

tape(
	`${ENDPOINT}
	GIVEN any configuration
	WHEN request has an unknown entity id`,
	(test: tape.Test) => {
		const id: Id = 'unknown';
		return runE2ETest({})(test)((t, assets) =>
			getPromisified({
				assets,
				request: {
					uri: URL(id),
				},
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
	WHEN request has a valid body referencing this entity`,
	(test: tape.Test) => {
		const id: Id = 'success';
		return runE2ETest({
			initialState: {
				...EMPTY_STATE,
				entityList: [createEntity(EntityType.MOCK)({ id })],
			},
		})(test)((t, assets) =>
			getPromisified({
				assets,
				request: {
					uri: URL(id),
				},
			}).then(response => {
				t.plan(4);
				const EXPECTED_RETURN_CODE = 200;
				const body = JSON.parse(response.body);
				t.equals(
					response.statusCode,
					EXPECTED_RETURN_CODE,
					`SHOULD return a ${EXPECTED_RETURN_CODE} response`,
				);
				t.equals(
					body.entity.id,
					id,
					'SHOULD return a JSON body having the entity id',
				);
				t.equal(typeof body.text, 'string', 'SHOULD return a descriptive text');
				t.deepEqual(
					body.links,
					[],
					'SHOULD return a JSON body having an empty link list',
				);
				t.end();
			}),
		);
	},
);
