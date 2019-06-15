import { OpenAPIBackend } from 'openapi-backend';

import { HandlerResponse } from '../../../services/openapi-backend/types';

export const getSpecification = (
  backendEngine: OpenAPIBackend,
) => (): HandlerResponse => ({
  json: backendEngine.definition,
  status: 200,
});
