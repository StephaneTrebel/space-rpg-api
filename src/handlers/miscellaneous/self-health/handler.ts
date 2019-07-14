import { Link } from '../../../services/webserver/types';

export const SELF_HEALTH_LINK: Link = {
	href: '/self-health/ping',
	rel: 'ping',
};

export const selfHealthPing = () => ({
	json: { message: 'pong' },
	status: 200,
});
