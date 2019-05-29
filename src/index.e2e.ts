import tape from 'tape';

import { runE2ETest } from './e2e-utils';

tape('Server starts properly: ', (t: tape.Test) =>
  runE2ETest()(t)(test => {
    test.pass('E2E server wrapper SHOULD sucessfully resolve');
    return Promise.resolve(test.end());
  }),
);
