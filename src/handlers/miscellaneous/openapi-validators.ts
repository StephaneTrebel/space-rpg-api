export const validationFail = (c: any, _req: any, res: any) => {
  console.log(c.validation.errors);
  res.status(400).json({ err: c.validation.errors });
};

export const notFound = (_c: any, _req: any, res: any) => {
  res.status(404).json({ err: 'not found' });
};

export const notImplemented = (c: any, _req: any, res: any) => {
  const { status, mock } = c.api.mockResponseForOperation(
    c.operation.operationId,
  );
  res.body = mock;
  res.status = status;
};
