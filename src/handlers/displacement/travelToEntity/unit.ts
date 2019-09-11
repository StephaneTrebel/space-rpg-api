import tape from 'tape';

import {
	configServiceFactory,
	DEFAULT_CONFIG,
} from '../../../services/config/service';
import { loggerServiceFactory } from '../../../services/logger/service';
import {
	stateServiceFactory,
	EMPTY_STATE,
} from '../../../services/state/service';
import { timeServiceFactory } from '../../../services/time/service';

import { createPlanet } from '../../../utils/planet/utils';
import { createSpaceship } from '../../../utils/spaceship/utils';

import * as testedModule from './handler';

const moduleName = 'Displacement TravelToEntity handler';

tape(
	`${moduleName}
	travelToEntity()
		GIVEN a State that has two entities
    WHEN called with an unknown target entity id`,
	(test: tape.Test) => {
		test.plan(3);
		const source = createPlanet({
			currentPosition: {
				x: 0,
				y: 0,
				z: 0,
			},
			id: 'source',
		});
		const configService = configServiceFactory({ ...DEFAULT_CONFIG });
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [source],
		});
		const timeService = timeServiceFactory({
			configService,
			loggerService,
			stateService,
		})();
		return testedModule
			.travelToEntity({
				loggerService,
				stateService,
				timeService,
			})({
				request: { requestBody: { entityId: source.id, targetId: 'lol' } },
			} as any)
			.then(handlerResponse => {
				const body = handlerResponse.json;
				test.equal(
					handlerResponse.status,
					400,
					'SHOULD sucessfully return a 400 response',
				);
				test.equal(
					typeof body.code,
					'string',
					'SHOULD sucessfully return a body having a code property',
				);
				test.equal(
					typeof body.message,
					'string',
					'SHOULD sucessfully return a body having a message property',
				);
				test.end();
			});
	},
);

tape(
	`${moduleName}
	travelToEntity()
		GIVEN a State that has two entities
    WHEN called with an unknown source entity id`,
	(test: tape.Test) => {
		test.plan(3);
		const target = createPlanet({
			currentPosition: {
				x: 0,
				y: 0,
				z: 0,
			},
			id: 'target',
		});
		const configService = configServiceFactory({ ...DEFAULT_CONFIG });
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [target],
		});
		const timeService = timeServiceFactory({
			configService,
			loggerService,
			stateService,
		})();
		return testedModule
			.travelToEntity({
				loggerService,
				stateService,
				timeService,
			})({
				request: { requestBody: { entityId: 'lol', targetId: target.id } },
			} as any)
			.then(handlerResponse => {
				const body = handlerResponse.json;
				test.equal(
					handlerResponse.status,
					400,
					'SHOULD sucessfully return a 400 response',
				);
				test.equal(
					typeof body.code,
					'string',
					'SHOULD sucessfully return a body having a code property',
				);
				test.equal(
					typeof body.message,
					'string',
					'SHOULD sucessfully return a body having a message property',
				);
				test.end();
			});
	},
);

tape(
	`${moduleName}
	travelToEntity()
		GIVEN a State that has two entities
    WHEN called with both entities as source and target`,
	(test: tape.Test) => {
		test.plan(4);
		const source = createSpaceship({
			currentPosition: {
				x: 0,
				y: 0,
				z: 0,
			},
			id: 'entity',
		});
		const target = createPlanet({
			currentPosition: {
				x: 0,
				y: 0,
				z: 0,
			},
			id: 'target',
		});
		const configService = configServiceFactory({ ...DEFAULT_CONFIG });
		const loggerService = loggerServiceFactory();
		const stateService = stateServiceFactory({ loggerService })({
			...EMPTY_STATE,
			entityList: [source, target],
		});
		const timeService = timeServiceFactory({
			configService,
			loggerService,
			stateService,
		})();
		return testedModule
			.travelToEntity({
				loggerService,
				stateService,
				timeService,
			})({
				request: {
					requestBody: { entityId: source.id, targetId: target.id },
				},
			} as any)
			.then(handlerResponse => {
				const body = handlerResponse.json;
				test.equal(
					handlerResponse.status,
					201,
					'SHOULD sucessfully return a 201 response',
				);
				test.equal(
					typeof body.displacementId,
					'string',
					'SHOULD sucessfully return a body having a displacementId property',
				);
				test.deepEqual(
					body.links,
					[
						{
							href: `/displacement/${handlerResponse.json.displacementId}`,
							rel: 'details',
						},
					],
					'SHOULD sucessfully return a body having a link to /displacement endpoint',
				);
				test.equal(
					typeof body.text,
					'string',
					'SHOULD sucessfully return a body having a text property',
				);
				test.end();
			});
	},
);
