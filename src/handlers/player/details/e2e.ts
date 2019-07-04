import tape from 'tape';

import { getPromisified, runE2ETest } from '../../../e2e-utils';

import { getURL, DEFAULT_CONFIG } from '../../../services/config/service';
import { EMPTY_STATE } from '../../../services/state/service';

import { Id } from '../../../utils/id/types';
import { createPlayer } from '../../../utils/player/utils';

const ENDPOINT = '/player';
const URL = (id: Id) => getURL(DEFAULT_CONFIG)(`${ENDPOINT}/${id}`);

tape(`${ENDPOINT}/:id`, (given: tape.Test) => {
  given.test('GIVEN any configuration', (when: tape.Test) => {
    when.test('WHEN request has an unknown player id', (cases: tape.Test) => {
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
    });
  });

  given.test(
    'GIVEN an application state with an existing player',
    (when: tape.Test) => {
      const playerA = createPlayer({ id: 'A' });
      const playerB = createPlayer({ id: 'B' });
      const playerC = createPlayer({ id: 'C' });
      when.test(
        'WHEN request has a valid id referencing this player',
        (cases: tape.Test) => {
          const id: Id = playerB.id;
          return runE2ETest({
            config: {
              ...DEFAULT_CONFIG,
            },
            initialState: {
              ...EMPTY_STATE,
              entityList: [playerA, playerB, playerC],
            },
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
              test.equal(
                body.player.id,
                id,
                'SHOULD return a JSON body having the player details',
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
    },
  );
});
