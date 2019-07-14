import tape from 'tape';

import { getPromisified, runE2ETest } from '../../../e2e-utils';

import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';
import { EMPTY_STATE } from '../../../services/state/service';

import { Id } from '../../../utils/id/types';

import { createEntity } from '../../../utils/entity/utils';
import { EntityType } from '../../../utils/entity/types';

const ENDPOINT = '/entity';
const URL = (id: Id) => getURL(DEFAULT_CONFIG)(`${ENDPOINT}/${id}`);

tape(`${ENDPOINT}/:id`, (given: tape.Test) => {
	given.test('GIVEN any configuration', (when: tape.Test) => {
		when.test('WHEN request has an unknown entity id', (cases: tape.Test) => {
			const id: Id = 'unknown';
			return runE2ETest({})(cases)((test, assets) =>
				getPromisified({
					assets,
					request: {
						uri: URL(id),
					},
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
	});

	given.test('GIVEN an existing entity', (when: tape.Test) => {
		when.test(
			'WHEN request has a valid body referencing this entity',
			(cases: tape.Test) => {
				const id: Id = 'success';
				return runE2ETest({
					initialState: {
						...EMPTY_STATE,
						entityList: [createEntity(EntityType.MOCK)({ id })],
					},
				})(cases)((test, assets) =>
					getPromisified({
						assets,
						request: {
							uri: URL(id),
						},
					}).then(response => {
						test.plan(3);
						const EXPECTED_RETURN_CODE = 200;
						const body = JSON.parse(response.body);
						test.equals(
							response.statusCode,
							EXPECTED_RETURN_CODE,
							`SHOULD return a ${EXPECTED_RETURN_CODE} response`,
						);
						test.equals(
							body.entity.id,
							id,
							'SHOULD return a JSON body having the entity id',
						);
						test.deepEqual(
							body.links,
							[],
							'SHOULD return a JSON body having an empty link list',
						);
						test.end();
					}),
				);
			},
		);
	});
});
