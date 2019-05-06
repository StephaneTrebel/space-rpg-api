import tape from 'tape';

import { runE2ETest, getPromisified } from '../../e2e-utils';

tape(`'/'`, (t: tape.Test) =>
  runE2ETest(t)(test =>
    getPromisified({ uri: 'http://127.0.0.1:9000/' }).then(response => {
      test.equals(response.statusCode, 200, 'status code SHOULD be 200');
      test.equals(
        typeof JSON.parse(response.body).message,
        'string',
        'SHOULD return a JSON body having a string message property',
      );
      test.deepEqual(
        JSON.parse(response.body).links,
        [
          {
            href: '/self-health/ping',
            rel: 'ping',
          },
        ],
        'SHOULD return a JSON body having a link to Self-Health Ping endpoint',
      );
      test.end();
    }),
  ),
);
