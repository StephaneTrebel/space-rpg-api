import fs from 'fs';

import * as yaml from 'js-yaml';

import {
  notFound,
  notImplemented,
  validationFail,
} from '../../handlers/miscellaneous/openapi-validators';

import { selfHealthPing } from '../../handlers/miscellaneous/self-health';
import { createPlayer } from '../../handlers/player/create/create';
import { root } from '../../handlers/root/root';

const loadSpecification = () => {
  return yaml.safeLoad(fs.readFileSync('src/openapi.yaml', 'utf8'));
};

const createBackend = (deps: { backendEngine: any }) => (
  specification: string,
) => {
  return new deps.backendEngine({
    ajvOpts: { unknownFormats: ['int32', 'int64'] },
    definition: specification,
    handlers: {
      createPlayer,
      notFound,
      notImplemented,
      root,
      selfHealthPing,
      validationFail,
    },
  });
};

export const spawnAPIBackend = (deps: { backendEngine: any }) => {
  return createBackend(deps)(loadSpecification()).init();
};
