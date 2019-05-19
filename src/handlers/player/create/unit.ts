import tape from 'tape';

import { stateServiceFactory } from '../../../services/state/service';

import * as testedModule from './handler';

tape('Player creation handler', (t: tape.Test) => {
  t.test('createPlayer()', (test: tape.Test) => {
    const MOCK_USERNAME = Symbol('username');
    testedModule.createPlayer({ stateService: stateServiceFactory() })(
      { request: { requestBody: { username: MOCK_USERNAME } } } as any,
      '' as any,
      {
        status: (returnedStatus: number) => ({
          json: (returnedJSON: {
            links: Array<{ href: string; rel: string }>;
            username: string;
          }) => {
            test.plan(3);
            test.equal(
              returnedStatus,
              201,
              'SHOULD sucessfully return a 201 response',
            );
            test.equal(
              returnedJSON.username,
              MOCK_USERNAME,
              'SHOULD sucessfully return a body having a username property',
            );
            test.deepEqual(
              returnedJSON.links,
              [
                {
                  href: '/self-health/ping',
                  rel: 'ping',
                },
              ],
              'SHOULD sucessfully return a body having a link to Self-Health Ping endpoint',
            );
            test.end();
          },
        }),
      } as any,
    );
  });

  t.test('createMockPlayer()', (test: tape.Test) => {
    test.plan(4);
    test.equal(
      typeof testedModule.createMockPlayer().username,
      'string',
      'createMockPlayer() SHOULD sucessfully return an object that has a username property',
    );
    test.equal(
      typeof testedModule.createMockPlayer().currentPosition.x,
      'number',
      'createMockPlayer() SHOULD sucessfully return an object that has a currentPosition.x property',
    );
    test.equal(
      typeof testedModule.createMockPlayer().currentPosition.y,
      'number',
      'createMockPlayer() SHOULD sucessfully return an object that has a currentPosition.y property',
    );
    test.equal(
      typeof testedModule.createMockPlayer().currentPosition.z,
      'number',
      'createMockPlayer() SHOULD sucessfully return an object that has a currentPosition.z property',
    );
    test.end();
  });
});
