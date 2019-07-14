import { SWAGGER_UI_LINK } from '../../services/openapi-backend/service';
import { HandlerResponse } from '../../services/openapi-backend/types';
import { Link } from '../../services/webserver/types';

import { SPECIFICATION_LINK } from '../../handlers/miscellaneous/specification/handler';

import { SELF_HEALTH_LINK } from '../miscellaneous/self-health/handler';
import { VERSIONS_LINK } from '../miscellaneous/versions/handler';

export const ROOT_LINK: Link = {
	href: '/',
	rel: 'root',
};

export const root = (): HandlerResponse => ({
	json: {
		links: [
			SELF_HEALTH_LINK,
			SPECIFICATION_LINK,
			SWAGGER_UI_LINK,
			VERSIONS_LINK,
		],
		message: [
			'Hi and welcome to Space RPG API !',
			'Please be aware of related links, the game will be way easier to understand if you pay attention to them.',
			'Have Fun !',
		].join(' '),
	},
	status: 200,
});
