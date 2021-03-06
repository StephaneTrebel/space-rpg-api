import fs from 'fs';

import { Response } from 'express';
import * as yaml from 'js-yaml';
import OpenAPIBackend from 'openapi-backend';
import { Context, Request } from 'openapi-backend';

import { getDisplacement } from '../../handlers/displacement/details/handler';
import { travelToEntity } from '../../handlers/displacement/travelToEntity/handler';
import { travelToPosition } from '../../handlers/displacement/travelToPosition/handler';
import { getEntityDetailsHandler } from '../../handlers/entity/details/handler';
import {
	notFound,
	validationFail,
} from '../../handlers/miscellaneous/openapi-validators/handler';
import { selfHealthPing } from '../../handlers/miscellaneous/self-health/handler';
import { getSpecification } from '../../handlers/miscellaneous/specification/handler';
import { getVersions } from '../../handlers/miscellaneous/versions/handler';
import { addNewPlayerHandler } from '../../handlers/player/create/handler';
import { getPlayerDetails } from '../../handlers/player/details/handler';
import { root } from '../../handlers/root/handler';

import { ConfigService } from '../config/types';
import { LoggerService } from '../logger/types';
import { StateService } from '../state/types';
import { TimeService } from '../time/types';
import { Link } from '../webserver/types';

import { AsyncHandler, Handler } from './types';

const loadSpecification = () => {
	return yaml.safeLoad(fs.readFileSync('src/openapi.yaml', 'utf8'));
};

export const SWAGGER_UI_LINK: Link = {
	href: '/swagger-ui/',
	rel: 'specification-ui',
};

export const isPromise = <T>(arg: any): arg is Promise<T> =>
	arg.then !== undefined;

type WrapHandler = (deps: {
	loggerService: LoggerService;
}) => (handler: Handler | AsyncHandler) => AsyncHandler;
export const wrapHandler: WrapHandler = ({ loggerService }) => handler => (
	context: any,
) => {
	const errorHandler = (error: Error) => {
		loggerService.error(`Error encountered in handler: ${error.message}`);
		return Promise.resolve({
			json: {
				code: 'HandlerError',
				message: `Error encountered: ${error.message}`,
			},
			status: 400,
		});
	};
	try {
		const result = handler(context);
		if (isPromise(result)) {
			return result.catch(errorHandler);
		}
		return Promise.resolve(result);
	} catch (error) {
		return errorHandler(error);
	}
};

type PostResponseHandler = (deps: {
	loggerService: LoggerService;
}) => (
	context: Context | undefined,
	req: Request,
	res: Response,
) => Response | void;
export const postResponseHandler: PostResponseHandler = deps => (
	context: Context | undefined,
	_req: Request,
	res: Response,
) => {
	try {
		deps.loggerService.debug('Entering postResponseHandler…');
		if (!context) {
			throw new Error('No context');
		}
		// Only validate response if request is valid
		if (context.validation && context.validation.valid) {
			deps.loggerService.debug(
				`Response is: ${JSON.stringify(context.response)}`,
			);
			const validationResult = context.api.validateResponse(
				context.response.json,
				context.operation || 'unknown',
				context.response.status,
			);
			if (validationResult.errors) {
				deps.loggerService.error(JSON.stringify(validationResult.errors));
				return res.status(502).json({
					code: 'ResponseValidationError',
					errors: validationResult.errors,
				});
			}
			deps.loggerService.debug('Response is valid.');
			return res.status(context.response.status).json(context.response.json);
		}
		// Request is invalid, so openapi-backend will take it from here
		return;
	} catch (error) {
		deps.loggerService.crit(error.message);
		return res
			.status(500)
			.json({ code: 'CriticalError', message: error.message });
	}
};

type CreateBackend = (deps: {
	backendEngine: typeof OpenAPIBackend;
	configService: ConfigService;
	loggerService: LoggerService;
	stateService: StateService;
	timeService: TimeService;
}) => (specification: string) => Promise<OpenAPIBackend>;
export const createBackend: CreateBackend = deps => specification =>
	new Promise((resolve, reject) => {
		try {
			deps.loggerService.debug('Entering createBackend…');
			const apiBackend = new deps.backendEngine({
				ajvOpts: { unknownFormats: ['int32', 'int64'] },
				definition: specification,
				strict: true,
				validate: true,
				withContext: true,
			});
			apiBackend.register({
				addNewPlayer: addNewPlayerHandler(deps),
				getDisplacement: getDisplacement(deps),
				getEntityDetails: getEntityDetailsHandler(deps),
				getPlayerDetails: getPlayerDetails(deps),
				getSpecification: getSpecification(apiBackend),
				getVersions: getVersions(deps),
				notFound, // openapi-backend specific
				postResponseHandler: postResponseHandler(deps), // openapi-backend specific
				root,
				selfHealthPing,
				travelToEntity: travelToEntity(deps),
				travelToPosition: travelToPosition(deps),
				validationFail, // openapi-backend specific
			});
			return resolve(apiBackend.init());
		} catch (error) {
			return reject(error);
		}
	});

export type SpawnAPIBackend = (deps: {
	backendEngine: typeof OpenAPIBackend;
	configService: ConfigService;
	loggerService: LoggerService;
	stateService: StateService;
	timeService: TimeService;
}) => Promise<OpenAPIBackend>;
export const spawnAPIBackend: SpawnAPIBackend = deps => {
	deps.loggerService.debug('Enterping spawnAPIBackend…');
	return createBackend(deps)(loadSpecification());
};
