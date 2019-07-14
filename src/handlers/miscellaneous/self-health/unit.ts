import tape from 'tape';

import * as testedModule from './handler';

tape('Self-health handler', (functions: tape.Test) => {
	functions.test('selfHealthPing()', (test: tape.Test) => {
		const handlerResponse = testedModule.selfHealthPing();
		test.plan(2);
		test.equal(
			handlerResponse.status,
			200,
			'SHOULD sucessfully return a 200 response',
		);
		test.deepEqual(
			handlerResponse.json,
			{ message: 'pong' },
			'SHOULD sucessfully return a body having a message',
		);
		test.end();
	});
});
