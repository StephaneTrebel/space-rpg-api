import tape from 'tape';

import { runE2ETest, postPromisified } from '../../../e2e-utils';

import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';
import { EMPTY_STATE } from '../../../services/state/service';

import { createEntity, MOCK_ENTITY } from '../../../utils/entity/utils';
import { Id } from '../../../utils/id/types';
import { Position } from '../../../utils/position/types';
import { EntityType } from '../../../utils/entity/types';

const ENDPOINT = '/displacement/travelToCoordinates';
const URL = getURL(DEFAULT_CONFIG)(ENDPOINT);

tape(ENDPOINT, (subTest: tape.Test) => {
  subTest.test('WHEN request has an invalid body', (caseTest: tape.Test) => {
    return runE2ETest({})(caseTest)((test, assets) =>
      postPromisified({
        assets,
        body: '',
        url: URL,
      }).then(response => {
        test.plan(1);
        const EXPECTED_RETURN_CODE = 400;
        test.equals(
          response.statusCode,
          EXPECTED_RETURN_CODE,
          `status code SHOULD be ${EXPECTED_RETURN_CODE}`,
        );
        test.end();
      }),
    );
  });

  subTest.test('GIVEN an existing entity', (givenClause: tape.Test) => {
    givenClause.test(
      'WHEN request has a valid body referencing this entity',
      (caseTest: tape.Test) => {
        const entityId: Id = `${ENDPOINT} Success`;
        const targetCoordinates: Position = { x: 0, y: 0, z: 0 };
        return runE2ETest({
          initialState: {
            ...EMPTY_STATE,
            entityList: [
              createEntity(EntityType.MOCK)({ ...MOCK_ENTITY, id: entityId }),
            ],
          },
        })(caseTest)((test, assets) =>
          postPromisified({
            assets,
            body: { entityId, targetCoordinates },
            json: true,
            url: URL,
          }).then(response => {
            test.plan(3);
            const EXPECTED_RETURN_CODE = 201;
            test.equals(
              response.statusCode,
              EXPECTED_RETURN_CODE,
              `status code SHOULD be ${EXPECTED_RETURN_CODE}`,
            );
            test.equals(
              typeof response.body.displacementId,
              'string',
              'SHOULD return a JSON body having a string id property',
            );
            test.deepEqual(
              response.body.links,
              [
                {
                  href: `/displacement/${response.body.displacementId}`,
                  rel: 'details',
                },
              ],
              'SHOULD return a JSON body having a link to GET Displacement endpoint',
            );
            test.end();
          }),
        );
      },
    );
  });
});
