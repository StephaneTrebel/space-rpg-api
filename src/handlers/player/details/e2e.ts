import tape from 'tape';

import { getPromisified, runE2ETest } from '../../../e2e-utils';

import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';
import { EMPTY_STATE } from '../../../services/state/service';

import { Id } from '../../../utils/id/types';
import { createPlayer } from '../../../utils/player/utils';

const BASE_ENDPOINT = '/player';
const URL = (id: Id) => getURL(DEFAULT_CONFIG)(`${BASE_ENDPOINT}/${id}`);
const ENDPOINT = `${BASE_ENDPOINT}/:id`;

tape(
	`${ENDPOINT}
	GIVEN any configuration
	WHEN request has an unknown player id`,
	(test: tape.Test) => {
		const id: Id = `unknown`;
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
	GIVEN an application state with an existing player
	WHEN request has a valid id referencing this player`,
	(test: tape.Test) => {
		const playerA = createPlayer({ id: 'A' });
		const playerB = createPlayer({ id: 'B' });
		const playerC = createPlayer({ id: 'C' });
		const id: Id = playerB.id;
		return runE2ETest({
			config: {
				...DEFAULT_CONFIG,
			},
			initialState: {
				...EMPTY_STATE,
				entityList: [playerA, playerB, playerC],
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
				t.equal(
					body.player.id,
					id,
					'SHOULD return a JSON body having the player details',
				);
				t.equal(
					typeof body.text,
					"string",
					'SHOULD return a descriptive text',
				);
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
