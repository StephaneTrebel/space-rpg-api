import tape from 'tape';

import { runE2ETest, getPromisified } from '../../e2e-utils';

tape(`'/self-health/ping'`, (t: tape.Test) =>
  runE2ETest(t)(test =>
    getPromisified({ uri: 'http://127.0.0.1:9000/self-health/ping' }).then(
      response => {
        const MESSAGE = 'pong';
        test.equals(response.statusCode, 200, 'status code SHOULD be 200');
        test.equals(
          JSON.parse(response.body).message,
          MESSAGE,
          `SHOULD return an object having a message property with "${MESSAGE}"`,
        );
        return test.end();
      },
    ),
  ),
);
