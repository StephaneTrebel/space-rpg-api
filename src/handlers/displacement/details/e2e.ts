import { Response } from 'request';
import tape from 'tape';

import {
	getPromisified,
	runE2ETest,
	setTimeoutPromisifed,
} from '../../../e2e-utils';

import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';
import { loggerServiceFactory } from '../../../services/logger/service';
import {
	EMPTY_STATE,
	stateServiceFactory,
} from '../../../services/state/service';
import { State, StateService } from '../../../services/state/types';

import {
	createDisplacement,
	createDisplacementMock,
} from '../../../utils/displacememt/utils';
import { EntityType } from '../../../utils/entity/types';
import { createEntity } from '../../../utils/entity/utils';
import { Id } from '../../../utils/id/types';
import { Spaceship } from '../../../utils/spaceship/types';

const BASE_ENDPOINT = '/displacement';
const ENDPOINT = `${BASE_ENDPOINT}/:id`;
const URL = (id: Id) => getURL(DEFAULT_CONFIG)(`${BASE_ENDPOINT}/${id}`);

tape(
	`${ENDPOINT}/:id
	GIVEN any configuration
	WHEN request has an unknown displacement id`,
	(t: tape.Test) => {
		const id: Id = 'unknown';
		return runE2ETest({})(t)((test, assets) =>
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
	},
);

tape(
	`${ENDPOINT}/:id
	GIVEN an existing displacement
	WHEN request has a valid body referencing this displacement`,
	(cases: tape.Test) => {
		const id: Id = 'success';
		return runE2ETest({
			config: {
				...DEFAULT_CONFIG,
				time: {
					startDelay: 5000,
				},
			},
			initialActionQueue: [createDisplacementMock({ id })],
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
					body.displacement.id,
					id,
					'SHOULD return a JSON body having the displacement id',
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

tape(
	`${ENDPOINT}/:id
	GIVEN an existing displacement in a started TimeService
    AND this displacement will not be done after three ticks`,
	(cases: tape.Test) => {
		cases.plan(12);
		const displacementId: Id = 'success_over_time_2';
		const entityId: Id = 'bar';
		const spaceship = createEntity(EntityType.SPACESHIP)({
			currentPosition: {
				x: 271,
				y: 923,
				z: 391,
			},
			fuel: 456,
			id: entityId,
			name: 'osef',
		});
		const PERIOD = 100;
		const START_DELAY = 1000;
		const EPSILON = 50;
		const checkReponse = (test: tape.Test) => (stateSvc: StateService) => (
			expectedFuel: number,
		) => (response: Response) => {
			const EXPECTED_RETURN_CODE = 200;
			const body = JSON.parse(response.body);
			test.equals(
				response.statusCode,
				EXPECTED_RETURN_CODE,
				`SHOULD return a ${EXPECTED_RETURN_CODE} response`,
			);
			test.equals(
				body.displacement.id,
				displacementId,
				'SHOULD return a JSON body having the displacement id',
			);
			test.equals(
				(stateSvc.findEntityById({ id: spaceship.id }) as Spaceship).fuel,
				expectedFuel,
				'SHOULD update the spaceship fuel value',
			);
			test.deepEqual(
				body.links,
				[],
				'SHOULD return a JSON body having an empty link list',
			);
		};
		const loggerService = loggerServiceFactory();
		const initialState: State = {
			...EMPTY_STATE,
			entityList: [spaceship],
		};
		const stateService = stateServiceFactory({ loggerService })(initialState);
		const startTimestamp = Date.now();
		return runE2ETest({
			config: {
				...DEFAULT_CONFIG,
				time: {
					period: PERIOD,
					startDelay: START_DELAY,
				},
			},
			initialActionQueue: [
				createDisplacement({
					loggerService,
					stateService,
				})({
					displacementId,
					entityId,
					target: {
						x: 666,
						y: 999,
						z: 400,
					},
				}),
			],
			initialState,
		})(cases)(
			(test, assets) =>
				new Promise(resolve => {
					setTimeoutPromisifed(
						() =>
							getPromisified({
								assets,
								request: {
									uri: `http://127.0.0.1:9000${BASE_ENDPOINT}/${displacementId}`,
								},
							}).then(checkReponse(test)(assets.stateService)(455)),
						START_DELAY - (Date.now() - startTimestamp) + PERIOD - EPSILON,
					);
					setTimeoutPromisifed(
						() =>
							getPromisified({
								assets,
								request: {
									uri: `http://127.0.0.1:9000${BASE_ENDPOINT}/${displacementId}`,
								},
							})
								.then(checkReponse(test)(assets.stateService)(454))
								.then(() => resolve(test.end())),
						START_DELAY - (Date.now() - startTimestamp) + PERIOD * 2 - EPSILON,
					);
					getPromisified({
						assets,
						request: {
							uri: `http://127.0.0.1:9000${BASE_ENDPOINT}/${displacementId}`,
						},
					}).then(checkReponse(test)(assets.stateService)(456));
				}),
		);
	},
);

tape(
	`${ENDPOINT}/:id
	GIVEN an existing displacement in a started TimeService
    AND this displacement will be done after two ticks`,
	(cases: tape.Test) => {
		cases.plan(14);
		const displacementId: Id = 'success_over_time';
		const entityId: Id = 'bar';
		const spaceship = createEntity(EntityType.SPACESHIP)({
			currentPosition: {
				x: 124,
				y: 455,
				z: 788,
			},
			fuel: 42,
			id: entityId,
			name: 'osef',
		});
		const PERIOD = 100;
		const START_DELAY = 1000;
		const EPSILON = 50;
		const checkReponse = (test: tape.Test) => (stateSvc: StateService) => (
			expectedFuel: number,
		) => (response: Response) => {
			const EXPECTED_RETURN_CODE = 200;
			const body = JSON.parse(response.body);
			test.equals(
				response.statusCode,
				EXPECTED_RETURN_CODE,
				`SHOULD return a ${EXPECTED_RETURN_CODE} response`,
			);
			test.equals(
				body.displacement.id,
				displacementId,
				'SHOULD return a JSON body having the displacement id',
			);
			test.equals(
				(stateSvc.findEntityById({ id: spaceship.id }) as Spaceship).fuel,
				expectedFuel,
				'SHOULD update the spaceship fuel value',
			);
			test.deepEqual(
				body.links,
				[],
				'SHOULD return a JSON body having an empty link list',
			);
		};
		const loggerService = loggerServiceFactory();
		const initialState: State = {
			...EMPTY_STATE,
			entityList: [spaceship],
		};
		const stateService = stateServiceFactory({ loggerService })(initialState);
		const startTimestamp = Date.now();
		return runE2ETest({
			config: {
				...DEFAULT_CONFIG,
				time: {
					period: PERIOD,
					startDelay: START_DELAY,
				},
			},
			initialActionQueue: [
				createDisplacement({
					loggerService,
					stateService,
				})({
					displacementId,
					entityId,
					target: {
						x: 124,
						y: 457,
						z: 790,
					},
				}),
			],
			initialState,
		})(cases)(
			(test, assets) =>
				new Promise(resolve => {
					setTimeoutPromisifed(
						() =>
							getPromisified({
								assets,
								request: {
									uri: `http://127.0.0.1:9000${BASE_ENDPOINT}/${displacementId}`,
								},
							}).then(checkReponse(test)(assets.stateService)(41)),
						START_DELAY - (Date.now() - startTimestamp) + PERIOD - EPSILON,
					);
					setTimeoutPromisifed(
						() =>
							getPromisified({
								assets,
								request: {
									uri: `http://127.0.0.1:9000${BASE_ENDPOINT}/${displacementId}`,
								},
							}).then(checkReponse(test)(assets.stateService)(40)),
						START_DELAY - (Date.now() - startTimestamp) + PERIOD * 2 - EPSILON,
					);
					setTimeoutPromisifed(
						() =>
							getPromisified({
								assets,
								request: {
									uri: `http://127.0.0.1:9000${BASE_ENDPOINT}/${displacementId}`,
								},
							})
								.then((response: Response) => {
									const EXPECTED_RETURN_CODE = 400;
									const body = JSON.parse(response.body);
									test.equals(
										response.statusCode,
										EXPECTED_RETURN_CODE,
										`SHOULD return a ${EXPECTED_RETURN_CODE} response`,
									);
									test.deepEqual(
										body.links,
										undefined,
										'SHOULD return a JSON body not having a link list',
									);
								})
								.then(() => resolve(test.end())),
						START_DELAY - (Date.now() - startTimestamp) + PERIOD * 3 - EPSILON,
					);
					getPromisified({
						assets,
						request: {
							uri: `http://127.0.0.1:9000${BASE_ENDPOINT}/${displacementId}`,
						},
					}).then(checkReponse(test)(assets.stateService)(42));
				}),
		);
	},
);
