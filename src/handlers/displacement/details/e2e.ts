import { Response } from 'request';
import tape from 'tape';

import {
  getPromisified,
  runE2ETest,
  setTimeoutPromisifed,
} from '../../../e2e-utils';

import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';
import { loggerServiceFactory } from '../../../services/logger/service';
import { EMPTY_STATE } from '../../../services/state/service';

import { createDisplacement } from '../../../utils/displacememt/utils';
import { Id } from '../../../utils/id/types';
import { MOCK_PLAYER } from '../../../utils/player/utils';

import { createDisplacementMock, MOCK_DISPLACEMENT } from './handler';

const ENDPOINT = '/displacement';
const URL = (id: Id) => getURL(DEFAULT_CONFIG)(`${ENDPOINT}/${id}`);

tape(`${ENDPOINT}/:id`, (given: tape.Test) => {
  given.test('GIVEN any configuration', (when: tape.Test) => {
    when.test(
      'WHEN request has an unknown displacement id',
      (cases: tape.Test) => {
        const id: Id = 'unknown';
        return runE2ETest({})(cases)((test, assets) =>
          getPromisified({
            assets,
            request: {
              uri: URL(id),
            },
          }).then(response => {
            test.plan(1);
            const EXPECTED_RETURN_CODE = 400;
            test.equals(
              response.statusCode,
              EXPECTED_RETURN_CODE,
              `SHOULD return a ${EXPECTED_RETURN_CODE} response`,
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
              uri: URL(id),
            },
          }).then(response => {
            test.plan(3);
            const EXPECTED_RETURN_CODE = 200;
            const body = JSON.parse(response.body);
            test.equals(
              response.statusCode,
              EXPECTED_RETURN_CODE,
              `SHOULD return a ${EXPECTED_RETURN_CODE} response`,
            );
            test.equals(
              body.displacement.id,
              id,
              'SHOULD return a JSON body having the displacement id',
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
    AND this displacement will not be done after three ticks`,
    (when: tape.Test) => {
      when.test(
        'WHEN requesting for this displacement existence',
        (cases: tape.Test) => {
          cases.plan(9);
          const displacementId: Id = 'success_over_time_2';
          const PERIOD = 100;
          const START_DELAY = 0;
          const EPSILON = 50;
          const checkReponse = (test: tape.Test) => (response: Response) => {
            const EXPECTED_RETURN_CODE = 200;
            const body = JSON.parse(response.body);
            test.equals(
              response.statusCode,
              EXPECTED_RETURN_CODE,
              `SHOULD return a ${EXPECTED_RETURN_CODE} response`,
            );
            test.equals(
              body.displacement.id,
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
                loggerService: loggerServiceFactory(),
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
              entityList: [
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

  given.test(
    `GIVEN an existing displacement in a started TimeService
    AND this displacement will be done after two ticks`,
    (when: tape.Test) => {
      when.test(
        'WHEN requesting for this displacement existence',
        (cases: tape.Test) => {
          cases.plan(8);
          const displacementId: Id = 'success_over_time';
          const PERIOD = 100;
          const START_DELAY = 100;
          const EPSILON = 50;
          const checkReponse = (test: tape.Test) => (response: Response) => {
            const EXPECTED_RETURN_CODE = 200;
            const body = JSON.parse(response.body);
            test.equals(
              response.statusCode,
              EXPECTED_RETURN_CODE,
              `SHOULD return a ${EXPECTED_RETURN_CODE} response`,
            );
            test.equals(
              body.displacement.id,
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
                loggerService: loggerServiceFactory(),
              })({
                displacementId,
                entityId,
                targetCoordinates: {
                  x: 124,
                  y: 457,
                  z: 790,
                },
              }),
            ],
            initialState: {
              ...EMPTY_STATE,
              entityList: [
                {
                  ...MOCK_PLAYER,
                  currentPosition: {
                    x: 124,
                    y: 455,
                    z: 788,
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
                  START_DELAY + PERIOD - EPSILON,
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
                    }).then((response: Response) => {
                      const EXPECTED_RETURN_CODE = 400;
                      const body = JSON.parse(response.body);
                      test.equals(
                        response.statusCode,
                        EXPECTED_RETURN_CODE,
                        `SHOULD return a ${EXPECTED_RETURN_CODE} response`,
                      );
                      test.deepEqual(
                        body.links,
                        undefined,
                        'SHOULD return a JSON body not having a link list',
                      );
                    }),
                  START_DELAY + PERIOD * 2 - EPSILON,
                ),
              )
              .then(() => test.end()),
          );
        },
      );
    },
  );
});
