import tape from 'tape';

import { runE2ETest, getPromisified } from '../../e2e-utils';

import { Id } from '../../types/id';

import { createDisplacementMock, MOCK_DISPLACEMENT } from './handler';

const ENDPOINT = '/displacement';

tape(ENDPOINT, (subTest: tape.Test) => {
  subTest.test(
    'WHEN request has an unknown displacement id',
    (caseTest: tape.Test) => {
      const id: Id = 'unknown';
      return runE2ETest()(caseTest)(test =>
        getPromisified({
          uri: `http://127.0.0.1:9000${ENDPOINT}/${id}`,
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
    },
  );

  subTest.test('GIVEN an existing displacement', (givenClause: tape.Test) => {
    givenClause.test(
      'WHEN request has a valid body referencing this displacement',
      (caseTest: tape.Test) => {
        const id: Id = 'success';
        return runE2ETest({
          initialActionQueue: [
            createDisplacementMock({ ...MOCK_DISPLACEMENT, id }),
          ],
        })(caseTest)(test =>
          getPromisified({
            uri: `http://127.0.0.1:9000${ENDPOINT}/${id}`,
          }).then(response => {
            test.plan(3);
            const EXPECTED_RETURN_CODE = 200;
            const body = JSON.parse(response.body);
            test.equals(
              response.statusCode,
              EXPECTED_RETURN_CODE,
              `status code SHOULD be ${EXPECTED_RETURN_CODE}`,
            );
            test.equals(
              body.id,
              id,
              'SHOULD return a JSON body having the exected id value',
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
  });
});
