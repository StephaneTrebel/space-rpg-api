import { OpenAPIBackend } from 'openapi-backend';

import { SELF_HEALTH_LINK } from '../miscellaneous/self-health/handler';
import { ROOT_LINK } from '../root/handler';

import { HandlerResponse } from '../../services/openapi-backend/types';

export const getSpecification = (
  backendEngine: OpenAPIBackend,
) => (): HandlerResponse => ({
  json: {
    links: [ROOT_LINK, SELF_HEALTH_LINK],
    specification: backendEngine.definition,
  },
  status: 200,
});
