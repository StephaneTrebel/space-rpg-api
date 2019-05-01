export const selfHealthPing = (_c: any, _req: any, res: any) => {
  res.status(200).json({ message: 'pong' });
};
