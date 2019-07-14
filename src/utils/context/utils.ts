import { Context } from 'openapi-backend';

type GetPropertyFromContextRequest = (
	property: string,
) => (context: Context) => string;
export const getPropertyFromContextRequest: GetPropertyFromContextRequest = property => context => {
	const params =
		context.request && context.request.params && context.request.params;
	if (params) {
		const param = params[property];
		if (typeof param === 'string') {
			return param;
		}
		throw new Error('Non-string params in Context request are unsupported');
	}
	throw new Error('No params in Context request');
};

type GetPropertyFromContextBody = (
	property: string,
) => (context: Context) => any;
export const getPropertyFromContextBody: GetPropertyFromContextBody = property => context => {
	const value =
		context.request &&
		context.request.requestBody &&
		context.request.requestBody &&
		context.request.requestBody[property];
	if (value) {
		return value;
	}
	throw new Error(`No property '${property}' in Context body`);
};
