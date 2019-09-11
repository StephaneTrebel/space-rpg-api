import { OpenAPIBackend } from 'openapi-backend';

import { HandlerResponse } from '../../../services/openapi-backend/types';

import { Link } from '../../../services/webserver/types';

export const SPECIFICATION_LINK: Link = {
	href: '/specification',
	rel: 'specification',
};

export const getSpecification = (
	backendEngine: OpenAPIBackend,
) => (): HandlerResponse => ({
	json: backendEngine.definition,
	status: 200,
});
