import { Response } from 'request';
import tape from 'tape';

import {
  getPromisified,
  runE2ETest,
  setTimeoutPromisifed,
} from '../../e2e-utils';

import { DEFAULT_CONFIG } from '../../services/config/service';
import { loggerServiceFactory } from '../../services/logger/service';
import { EMPTY_STATE } from '../../services/state/service';

import { Id } from '../../types/id';

import { MOCK_PLAYER } from '../player/create/handler';

import { createDisplacementMock, MOCK_DISPLACEMENT } from './handler';
import { createDisplacement } from './start/handler';

const ENDPOINT = '/displacement';

tape(ENDPOINT, (given: tape.Test) => {
  given.test('GIVEN any configuration', (when: tape.Test) => {
    when.test(
      'WHEN request has an unknown displacement id',
      (cases: tape.Test) => {
        const id: Id = 'unknown';
        return runE2ETest({})(cases)((test, assets) =>
          getPromisified({
            assets,
            request: {
              uri: `http://127.0.0.1:9000${ENDPOINT}/${id}`,
            },
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
  });

  given.test('GIVEN an existing displacement', (when: tape.Test) => {
    when.test(
      'WHEN request has a valid body referencing this displacement',
      (cases: tape.Test) => {
        const id: Id = 'success';
        return runE2ETest({
          config: {
            ...DEFAULT_CONFIG,
            time: {
              startDelay: 5000,
            },
          },
          initialActionQueue: [
            createDisplacementMock({ ...MOCK_DISPLACEMENT, id }),
          ],
        })(cases)((test, assets) =>
          getPromisified({
            assets,
            request: {
              uri: `http://127.0.0.1:9000${ENDPOINT}/${id}`,
            },
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

  given.test(
    `GIVEN an existing displacement in a started TimeService
    AND this displacement in not finished after three ticks`,
    (when: tape.Test) => {
      when.test(
        'WHEN requesting for this displacement existence',
        (cases: tape.Test) => {
          cases.plan(9);
          const displacementId: Id = 'success_over_time';
          const PERIOD = 100;
          const START_DELAY = 0;
          // The adjustment threshold with the server, to ensure we query it
          // just before its next "tick". Warning: this may have to be
          // maintained over time !
          const EPSILON = 50;
          const checkReponse = (test: tape.Test) => (response: Response) => {
            const EXPECTED_RETURN_CODE = 200;
            const body = JSON.parse(response.body);
            test.equals(
              response.statusCode,
              EXPECTED_RETURN_CODE,
              `status code SHOULD be ${EXPECTED_RETURN_CODE}`,
            );
            test.equals(
              body.id,
              displacementId,
              'SHOULD return a JSON body having the displacement id',
            );
            test.deepEqual(
              body.links,
              [],
              'SHOULD return a JSON body having an empty link list',
            );
          };
          const entityId: Id = 'bar';
          return runE2ETest({
            config: {
              ...DEFAULT_CONFIG,
              time: {
                period: PERIOD,
                startDelay: START_DELAY,
              },
            },
            initialActionQueue: [
              createDisplacement({
                loggerService: loggerServiceFactory({ console: true }),
              })({
                displacementId,
                entityId,
                targetCoordinates: {
                  x: 666,
                  y: 999,
                  z: 400,
                },
              }),
            ],
            initialState: {
              ...EMPTY_STATE,
              playerList: [
                {
                  ...MOCK_PLAYER,
                  currentPosition: {
                    x: 271,
                    y: 923,
                    z: 391,
                  },
                  id: entityId,
                },
              ],
            },
          })(cases)((test, assets) =>
            getPromisified({
              assets,
              request: {
                uri: `http://127.0.0.1:9000${ENDPOINT}/${displacementId}`,
              },
            })
              .then(checkReponse(test))
              .then(() =>
                setTimeoutPromisifed(
                  () =>
                    getPromisified({
                      assets,
                      request: {
                        uri: `http://127.0.0.1:9000${ENDPOINT}/${displacementId}`,
                      },
                    }).then(checkReponse(test)),
                  PERIOD - EPSILON,
                ),
              )
              .then(() =>
                setTimeoutPromisifed(
                  () =>
                    getPromisified({
                      assets,
                      request: {
                        uri: `http://127.0.0.1:9000${ENDPOINT}/${displacementId}`,
                      },
                    }).then(checkReponse(test)),
                  PERIOD * 2 - EPSILON,
                ),
              )
              .then(() => test.end()),
          );
        },
      );
    },
  );
});
