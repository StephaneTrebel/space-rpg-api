import fs from 'fs';

import * as yaml from 'js-yaml';
import OpenAPIBackend from 'openapi-backend';

import { getDisplacement } from '../../handlers/displacement/handler';
import { startDisplacement } from '../../handlers/displacement/start/handler';
import { selfHealthPing } from '../../handlers/miscellaneous/self-health/handler';
import {
  notFound,
  notImplemented,
  validationFail,
} from '../../handlers/miscellaneous/openapi-validators/handler';
import { addNewPlayer } from '../../handlers/player/create/handler';
import { root } from '../../handlers/root/handler';
import { getSpecification } from '../../handlers/specification/handler';

import { LoggerService } from '../logger/types';
import { StateService } from '../state/types';
import { TimeService } from '../time/types';

const loadSpecification = () => {
  return yaml.safeLoad(fs.readFileSync('src/openapi.yaml', 'utf8'));
};

const createBackend = (deps: {
  backendEngine: typeof OpenAPIBackend;
  loggerService: LoggerService;
  stateService: StateService;
  timeService: TimeService;
}) => (specification: string) => {
  deps.loggerService.debug('Entering createBackend…');
  const apiBackend = new deps.backendEngine({
    ajvOpts: { unknownFormats: ['int32', 'int64'] },
    definition: specification,
    strict: true,
    validate: true,
    withContext: true,
  });
  apiBackend.register({
    addNewPlayer: addNewPlayer(deps),
    getDisplacement: getDisplacement(deps),
    getSpecification: getSpecification(apiBackend),
    notFound,
    notImplemented,
    root,
    selfHealthPing,
    startDisplacement: startDisplacement(deps),
    validationFail,
  });
  return apiBackend.init();
};

export type SpawnAPIBackend = (deps: {
  backendEngine: typeof OpenAPIBackend;
  loggerService: LoggerService;
  stateService: StateService;
  timeService: TimeService;
}) => Promise<OpenAPIBackend>;
export const spawnAPIBackend: SpawnAPIBackend = deps => {
  deps.loggerService.debug('Enterping spawnAPIBackend…');
  return createBackend(deps)(loadSpecification());
};
