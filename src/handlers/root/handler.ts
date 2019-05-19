export const root = (_c: any, _req: any, res: any) => {
  res.status(200).json({
    links: [
      {
        href: '/self-health/ping',
        rel: 'ping',
      },
    ],
    message: `Hi and welcome to Space RPG API !
      Please be aware of related links, the game will be way easier to understand if you pay attention to them.
      Have Fun !`,
  });
};
