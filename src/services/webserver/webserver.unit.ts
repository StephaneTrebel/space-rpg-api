import tape from 'tape';
import * as testedModule from './webserver';

tape('Webserver', (test: tape.Test) => {
  test.plan(3);
  const express: any = function(this: any) {
    return express;
  };
  express.use = (fn: () => void) => {
    fn();
    return express;
  };
  express.json = () => () => {
    test.pass('spawnWebserver SHOULD use JSON Express module');
  };
  express.listen = (_ignore: number, callback: () => void) => {
    test.pass('spawnWebserver SHOULD start a listening process');
    test.end();
    return callback();
  };
  testedModule.spawnWebServer({
    cors: () => () => test.pass('spawnWebserver SHOULD use CORS middleware'),
    express,
  })({
    handleRequest: () => ({}),
  });
});
