import tape from 'tape';

import * as testedModule from './utils';

tape('Id utils', (functions: tape.Test) => {
	functions.test('isId()', (cases: tape.Test) => {
		cases.test('WHEN called something that is not an Id', (test: tape.Test) => {
			test.plan(5);
			test.equal(testedModule.isId(true), false, 'SHOULD return false');
			test.equal(testedModule.isId(undefined), false, 'SHOULD return false');
			test.equal(testedModule.isId(1), false, 'SHOULD return false');
			test.equal(testedModule.isId({}), false, 'SHOULD return false');
			test.equal(testedModule.isId([]), false, 'SHOULD return false');
			test.end();
		});

		cases.test('WHEN called something that is an Id', (test: tape.Test) => {
			test.plan(1);
			test.equal(testedModule.isId('lol'), true, 'SHOULD return true');
			test.end();
		});
	});

	functions.test('generateId()', (cases: tape.Test) => {
		cases.test('WHEN called', (test: tape.Test) => {
			test.plan(1);
			test.equal(
				typeof testedModule.generateId(),
				'string',
				'SHOULD return a string',
			);
			test.end();
		});
	});
});
