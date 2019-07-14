import tape from 'tape';

import { loggerServiceFactory } from '../../../services/logger/service';
import {
	configServiceFactory,
	DEFAULT_CONFIG,
} from '../../../services/config/service';

import * as testedModule from './handler';
import { Versions } from './types';

tape('Versions handler', (functions: tape.Test) => {
	functions.test('getVersions()', (test: tape.Test) => {
		const versions: Versions = {
			'space-rpg-api': '4.3.2',
		};
		const handlerResponse = testedModule.getVersions({
			configService: configServiceFactory({
				...DEFAULT_CONFIG,
				versions,
			}),
			loggerService: loggerServiceFactory(),
		})(undefined as any);
		test.plan(2);
		test.equal(
			handlerResponse.status,
			200,
			'SHOULD sucessfully return a 200 response',
		);
		test.deepEqual(
			handlerResponse.json,
			versions,
			'SHOULD sucessfully return a body having the expected versions property',
		);
		test.end();
	});
});
