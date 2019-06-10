import { OpenAPIBackend } from 'openapi-backend';

export const getSpecification = (backendEngine: OpenAPIBackend) => (
  _c: any,
  _req: any,
  res: any,
) => {
  res.status(200).json({
    links: [
      {
        href: '/',
        rel: 'root',
      },
      {
        href: '/self-health/ping',
        rel: 'ping',
      },
    ],
    specification: backendEngine.definition,
  });
};
