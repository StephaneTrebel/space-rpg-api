// import tape from 'tape';

// import { runE2ETest, postPromisified } from '../../../e2e-utils';

// const ENDPOINT = '/displacement/start';

// tape(ENDPOINT, (subTest: tape.Test) => {
  // subTest.test('WHEN request has an invalid body', (t: tape.Test) =>
    // runE2ETest(t)(test =>
      // postPromisified({
        // body: '',
        // url: `http://127.0.0.1:9000${ENDPOINT}`,
      // }).then(response => {
        // const EXPECTED_RETURN_CODE = 400;
        // test.equals(
          // response.statusCode,
          // EXPECTED_RETURN_CODE,
          // `status code SHOULD be ${EXPECTED_RETURN_CODE}`,
        // );
        // test.end();
      // }),
    // ),
  // );
  // subTest.test('WHEN request has a valid body', (t: tape.Test) => {
    // const MOCK_USERNAME = 'mock_username';
    // runE2ETest(t)(test =>
      // postPromisified({
        // body: { targetCoordinates: { x: 0, y: 0, z: 0 } },
        // json: true,
        // url: `http://127.0.0.1:9000${ENDPOINT}`,
      // }).then(response => {
        // const EXPECTED_RETURN_CODE = 201;
        // test.equals(
          // response.statusCode,
          // EXPECTED_RETURN_CODE,
          // `status code SHOULD be ${EXPECTED_RETURN_CODE}`,
        // );
        // test.equals(
          // response.body.displacementId,
          // MOCK_DISPLACEMENT_ID,
          // 'SHOULD return a JSON body having the expected username property',
        // );
        // test.equals(
          // response.body.targetCoordinates,
          // MOCK_TARGET_,
          // 'SHOULD return a JSON body having the expected username property',
        // );
        // test.deepEqual(
          // response.body.links,
          // [
            // {
              // href: '/self-health/ping',
              // rel: 'ping',
            // },
          // ],
          // 'SHOULD return a JSON body having a link to Self-Health Ping endpoint',
        // );
        // test.end();
      // }),
    // );
  // });
// });
