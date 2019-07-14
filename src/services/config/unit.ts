import tape from 'tape';

import { Versions } from '../../handlers/miscellaneous/versions/types';

import { DEFAULT_LOGGER_CONFIG } from '../logger/service';
import { LoggerConfig } from '../logger/types';
import { TimeConfig } from '../time/types';
import { ServerConfig } from '../webserver/types';

import * as testedModule from './service';

tape('Config service', (functions: tape.Test) => {
	functions.test('getURL()', (cases: tape.Test) => {
		cases.test(
			`WHEN called with a configuration
    AND an endpoint`,
			(test: tape.Test) => {
				test.plan(1);
				test.equal(
					testedModule.getURL({
						...testedModule.DEFAULT_CONFIG,
						server: {
							baseURL: 'toto',
							port: 1234,
						},
					})('/foo/bar'),
					'toto/foo/bar',
					'SHOULD send back the computed URL',
				);
				test.end();
			},
		);
	});

	functions.test('Service tests', (given: tape.Test) => {
		given.test(
			'GIVEN a configuration that has a logger subconfig',
			(when: tape.Test) => {
				when.test('WHEN called with that configuration', (test: tape.Test) => {
					test.plan(1);
					const loggerConfig: LoggerConfig = DEFAULT_LOGGER_CONFIG;
					test.equal(
						testedModule
							.configServiceFactory({
								...testedModule.DEFAULT_CONFIG,
								logger: loggerConfig,
							})
							.getLoggerConfig(),
						loggerConfig,
						'SHOULD retrieve the logger subconfig',
					);
					test.end();
				});
			},
		);

		given.test(
			'GIVEN a configuration that has a server subconfig',
			(when: tape.Test) => {
				when.test('WHEN called with that configuration', (test: tape.Test) => {
					test.plan(1);
					const serverConfig: ServerConfig = {
						baseURL: 'foo',
						port: 1234,
					};
					test.equal(
						testedModule
							.configServiceFactory({
								...testedModule.DEFAULT_CONFIG,
								server: serverConfig,
							})
							.getServerConfig(),
						serverConfig,
						'SHOULD retrieve the server subconfig',
					);
					test.end();
				});
			},
		);

		given.test(
			'GIVEN a configuration that has a time subconfig',
			(when: tape.Test) => {
				when.test('WHEN called with that configuration', (test: tape.Test) => {
					test.plan(1);
					const timeConfig: TimeConfig = {
						period: 1234,
						startDelay: 5678,
					};
					test.equal(
						testedModule
							.configServiceFactory({
								...testedModule.DEFAULT_CONFIG,
								time: timeConfig,
							})
							.getTimeConfig(),
						timeConfig,
						'SHOULD retrieve the time subconfig',
					);
					test.end();
				});
			},
		);

		given.test(
			'GIVEN a configuration that has a versions subconfig',
			(when: tape.Test) => {
				when.test('WHEN called with that configuration', (test: tape.Test) => {
					test.plan(1);
					const versions: Versions = {
						'space-rpg-api': '1.2.3',
					};
					test.equal(
						testedModule
							.configServiceFactory({
								...testedModule.DEFAULT_CONFIG,
								versions,
							})
							.getVersions(),
						versions,
						'SHOULD retrieve the versions subconfig',
					);
					test.end();
				});
			},
		);
	});
});
