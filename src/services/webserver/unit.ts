import tape from 'tape';

import { configServiceFactory } from '../config/service';
import { loggerServiceFactory } from '../logger/service';

import * as testedModule from './service';

tape('Webserver service', (functions: tape.Test) => {
  functions.test('spawnWebServer()', (test: tape.Test) => {
    test.plan(4);
    const express: any = function(this: any) {
      return express;
    };
    express.get = (_osef: string, fn: (req: any, res: any) => void) => {
      fn(undefined, {
        send: () => {
          return;
        },
      });
      return express;
    };
    express.use = (arg1: string | (() => void)) => {
      if (typeof arg1 === 'function') {
        arg1();
      }
      return express;
    };
    express.json = () => () => {
      test.pass('SHOULD use JSON Express module');
    };
    express.listen = (_ignore: number, fn: () => void) => {
      fn();
      test.pass('SHOULD start a listening process');
      test.end();
    };
    express.static = () => {
      test.pass('SHOULD serve static assets');
    };
    testedModule.spawnWebServer({
      configService: configServiceFactory(),
      cors: () => () => test.pass('SHOULD use CORS middleware'),
      express,
      loggerService: loggerServiceFactory(),
    })({
      handleRequest: () => ({}),
    });
  });
});
