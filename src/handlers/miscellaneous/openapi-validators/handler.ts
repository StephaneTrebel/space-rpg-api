export const validationFail = (c: any, _req: any, res: any) => {
	res.status(400).json({ err: c.validation.errors });
};

export const notFound = (_c: any, _req: any, res: any) => {
	res.status(404).json({ err: 'not found' });
};
