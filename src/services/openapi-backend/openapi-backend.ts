import fs from 'fs';

import * as yaml from 'js-yaml';

import { StateService } from '../state/state';

import {
  notFound,
  notImplemented,
  validationFail,
} from '../../handlers/miscellaneous/openapi-validators';

import { selfHealthPing } from '../../handlers/miscellaneous/self-health';
import { createPlayer } from '../../handlers/player/create/create';
import { root } from '../../handlers/root/root';

import { LoggerService } from '../logger/logger';
import { Universe } from '../../assets/universe';

const loadSpecification = () => {
  return yaml.safeLoad(fs.readFileSync('src/openapi.yaml', 'utf8'));
};

const createBackend = (deps: {
  backendEngine: any;
  loggerService: LoggerService;
  stateService: StateService;
  universe: Universe;
}) => (specification: string) => {
  deps.loggerService.info('Creating backend');
  return new deps.backendEngine({
    ajvOpts: { unknownFormats: ['int32', 'int64'] },
    definition: specification,
    handlers: {
      createPlayer: createPlayer(deps),
      notFound,
      notImplemented,
      root,
      selfHealthPing,
      validationFail,
    },
  });
};

export const spawnAPIBackend = (deps: {
  backendEngine: any;
  loggerService: LoggerService;
  stateService: StateService;
  universe: Universe;
}) => {
  return createBackend(deps)(loadSpecification()).init();
};
