import tape from 'tape';

import { SPECIFICATION_LINK } from '../../handlers/miscellaneous/specification/handler';
import { SWAGGER_UI_LINK } from '../../services/openapi-backend/service';

import { SELF_HEALTH_LINK } from '../miscellaneous/self-health/handler';

import * as testedModule from './handler';
import { VERSIONS_LINK } from "../miscellaneous/versions/handler";

tape('Root handler', (functions: tape.Test) => {
  functions.test('root()', (test: tape.Test) => {
    const handlerResponse = testedModule.root();
    test.plan(3);
    test.equal(
      handlerResponse.status,
      200,
      'SHOULD sucessfully return a 200 response',
    );
    test.equal(
      typeof handlerResponse.json.message,
      'string',
      'SHOULD sucessfully return a body having a message',
    );
    test.deepEqual(
      handlerResponse.json.links,
      [SELF_HEALTH_LINK, SPECIFICATION_LINK, SWAGGER_UI_LINK, VERSIONS_LINK],
      'SHOULD sucessfully return a body having a link to various endpoints',
    );
    test.end();
  });
});
