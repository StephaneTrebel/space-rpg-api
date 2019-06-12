import { HandlerResponse } from '../../services/openapi-backend/types';
import { Link } from '../../services/webserver/types';

export const ROOT_LINK: Link = {
  href: '/',
  rel: 'root',
};

export const root = (): HandlerResponse => ({
  json: {
    links: [
      {
        href: '/self-health/ping',
        rel: 'ping',
      },
    ],
    message: `Hi and welcome to Space RPG API !
        Please be aware of related links, the game will be way easier to understand if you pay attention to them.
      Have Fun !`,
  },
  status: 200,
});
