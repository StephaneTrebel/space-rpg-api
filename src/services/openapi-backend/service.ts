import fs from 'fs';

import * as yaml from 'js-yaml';

import { StateService } from '../state/service';

import { getDisplacement } from '../../handlers/displacement/handler';
import { startDisplacement } from '../../handlers/displacement/start/handler';
import { selfHealthPing } from '../../handlers/miscellaneous/self-health/handler';
import {
  notFound,
  notImplemented,
  validationFail,
} from '../../handlers/miscellaneous/openapi-validators/handler';
import { createPlayer } from '../../handlers/player/create/handler';
import { root } from '../../handlers/root/handler';

import { LoggerService } from '../logger/types';
import { TimeService } from '../time/types';

const loadSpecification = () => {
  return yaml.safeLoad(fs.readFileSync('src/openapi.yaml', 'utf8'));
};

const createBackend = (deps: {
  backendEngine: any;
  loggerService: LoggerService;
  stateService: StateService;
  timeService: TimeService;
}) => (specification: string) => {
  deps.loggerService.info('Creating backend');
  return new deps.backendEngine({
    ajvOpts: { unknownFormats: ['int32', 'int64'] },
    definition: specification,
    handlers: {
      createPlayer: createPlayer(deps),
      getDisplacement,
      notFound,
      notImplemented,
      root,
      selfHealthPing,
      startDisplacement,
      validationFail,
    },
  });
};

export const spawnAPIBackend = (deps: {
  backendEngine: any;
  loggerService: LoggerService;
  stateService: StateService;
  timeService: TimeService;
}) => {
  return createBackend(deps)(loadSpecification()).init();
};
