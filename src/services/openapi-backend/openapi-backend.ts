import fs from 'fs';

import * as yaml from 'js-yaml';
import OpenAPIBackend from 'openapi-backend';

import { selfHealthPing } from '../../handlers/miscellaneous/self-health';
import {
  notFound,
  notImplemented,
  validationFail,
} from '../../handlers/miscellaneous/openapi-validators';

const loadSpecification = () => {
  console.debug('loadSpecification()');
  return yaml.safeLoad(fs.readFileSync('openapi.yaml', 'utf8'));
};

const createBackend = (specification: string) => {
  console.debug('createBackend()');
  return new OpenAPIBackend({
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

export const spawnAPIBackend = () => {
  console.debug('spawnAPIBackend()');
  return createBackend(loadSpecification()).init();
};
