import { Response } from 'express';
import { Context } from 'openapi-backend';

export const createPlayer = (context: Context, _req: any, res: Response) => {
  res.status(201).json({
    links: [
      {
        href: '/self-health/ping',
        rel: 'ping',
      },
    ],
    username: context.request && context.request.requestBody.username,
  });
};
