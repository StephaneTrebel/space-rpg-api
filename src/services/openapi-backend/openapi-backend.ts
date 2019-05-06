import fs from 'fs';

import * as yaml from 'js-yaml';

import { selfHealthPing } from '../../handlers/miscellaneous/self-health';
import {
  notFound,
  notImplemented,
  validationFail,
} from '../../handlers/miscellaneous/openapi-validators';

const loadSpecification = () => {
  return yaml.safeLoad(fs.readFileSync('openapi.yaml', 'utf8'));
};

const createBackend = (deps: { backendEngine: any }) => (
  specification: string,
) => {
  return new deps.backendEngine({
    ajvOpts: { unknownFormats: ['int32', 'int64'] },
    definition: specification,
    handlers: {
      notFound,
      notImplemented,
      selfHealthPing,
      validationFail,
    },
  });
};

export const spawnAPIBackend = (deps: { backendEngine: any }) => {
  return createBackend(deps)(loadSpecification()).init();
};
