import tape from 'tape';

import { DEFAULT_CONFIG } from '../services/config/service';
import { loggerServiceFactory } from '../services/logger/service';

import * as testedModule from './main';

tape('Index script', (functions: tape.Test) => {
	functions.test('instanciateApplication()', (given: tape.Test) => {
		given.test('GIVEN improper dependencies', (when: tape.Test) =>
			when.test('WHEN called with these depencencies', (test: tape.Test) => {
				test.plan(1);
				return testedModule
					.instanciateApplication({
						spawnAPIBackend: () => Promise.reject(new Error('NOPE')),
						spawnWebServer: 'foo',
					} as any)
					.catch(() => {
						test.pass('SHOULD eventually return an error');
						test.end();
					});
			}),
		);

		given.test('GIVEN proper dependencies', (when: tape.Test) =>
			when.test('WHEN called with these depencencies', (test: tape.Test) => {
				test.plan(2);
				return testedModule
					.instanciateApplication({
						loggerService: loggerServiceFactory(),
						spawnAPIBackend: () =>
							Promise.resolve(test.pass('SHOULD spawn an OpenAPI back-end')),
						spawnWebServer: () => () => test.pass('SHOULD spawn a Web Server'),
					} as any)
					.then(() => test.end());
			}),
		);
	});

	functions.test('main()', (given: tape.Test) => {
		given.test('GIVEN improper dependencies', (when: tape.Test) =>
			when.test('WHEN called', (test: tape.Test) => {
				test.plan(1);
				return testedModule
					.main({
						spawnAPIBackend: () => Promise.reject(new Error('NOPE')),
					} as any)('params' as any)
					.catch(() => {
						test.pass('SHOULD eventually return an error');
						test.end();
					});
			}),
		);

		given.test('GIVEN proper dependencies', (when: tape.Test) => {
			when.test('WHEN called with improper params', (test: tape.Test) => {
				test.plan(1);
				return testedModule
					.main({} as any)(undefined as any)
					.catch(() => {
						test.pass('SHOULD eventually return an error');
						test.end();
					});
			});

			when.test('WHEN called with startTime to false', (test: tape.Test) => {
				test.plan(2);
				return testedModule
					.main({
						spawnAPIBackend: () =>
							Promise.resolve(test.pass('SHOULD spawn an OpenAPI back-end')),
						spawnWebServer: () => () => {
							test.pass('main SHOULD spawn a Web Server');
							return {
								close: () => {
									return;
								},
							};
						},
					} as any)({ config: DEFAULT_CONFIG, startTime: false })
					.then(assets => assets.teardown())
					.then(() => test.end());
			});

			when.test(
				'WHEN main function is called with startTime to true',
				(test: tape.Test) => {
					test.plan(2);
					return testedModule
						.main({
							spawnAPIBackend: () =>
								Promise.resolve(test.pass('SHOULD spawn an OpenAPI back-end')),
							spawnWebServer: () => () => {
								test.pass('SHOULD spawn a Web Server');
								return {
									close: () => {
										return;
									},
								};
							},
						} as any)({ config: DEFAULT_CONFIG, startTime: true })
						.then(assets => assets.teardown())
						.then(() => test.end());
				},
			);
		});
	});
});
