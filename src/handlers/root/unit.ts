import tape from 'tape';

import { SPECIFICATION_LINK } from '../../handlers/miscellaneous/specification/handler';
import { SWAGGER_UI_LINK } from '../../services/openapi-backend/service';

import { SELF_HEALTH_LINK } from '../miscellaneous/self-health/handler';

import * as testedModule from './handler';
import { VERSIONS_LINK } from '../miscellaneous/versions/handler';

const moduleName = 'Root handler';

tape(
	`${moduleName}
	root()
		WHEN called `,
	(test: tape.Test) => {
		const handlerResponse = testedModule.root();
		test.plan(3);
		test.equal(
			handlerResponse.status,
			200,
			'SHOULD sucessfully return a 200 response',
		);
		test.equal(
			typeof handlerResponse.json.text,
			'string',
			'SHOULD sucessfully return a body having a text',
		);
		test.deepEqual(
			handlerResponse.json.links,
			[SELF_HEALTH_LINK, SPECIFICATION_LINK, SWAGGER_UI_LINK, VERSIONS_LINK],
			'SHOULD sucessfully return a body having a link to various endpoints',
		);
		test.end();
	},
);
