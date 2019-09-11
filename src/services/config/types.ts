import { Versions } from '../../handlers/miscellaneous/versions/types';

import { LoggerConfig } from '../logger/types';
import { TimeConfig } from '../time/types';
import { ServerConfig } from '../webserver/types';

export interface Config {
	logger: LoggerConfig;
	server: ServerConfig;
	time: TimeConfig;
	versions: Versions;
}

export interface ConfigService {
	getLoggerConfig: () => LoggerConfig;
	getServerConfig: () => ServerConfig;
	getTimeConfig: () => TimeConfig;
	getURL: (endpoint: string) => string;
	getVersions: () => Versions;
}
