export const createPlayer = (_c: any, _req: any, res: any) => {
  res.status(201).json({
    links: [
      {
        href: '/self-health/ping',
        rel: 'ping',
      },
    ],
    username: 'toto',
  });
};
