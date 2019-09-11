import http from 'http';

import { Config } from '../services/config/types';
import { LoggerService } from '../services/logger/types';
import { SpawnAPIBackend } from '../services/openapi-backend/service';
import { State, StateService } from '../services/state/types';
import { ActionList } from '../services/time/types';
import { SpawnWebServer } from '../services/webserver/service';

export interface MainDeps {
	initialActionQueue?: ActionList;
	initialState: State;
	spawnAPIBackend: SpawnAPIBackend;
	spawnWebServer: SpawnWebServer;
}

export interface MainParams {
	config: Config;
	startTime?: boolean;
}

export interface MainAssets {
	loggerService: LoggerService;
	server: http.Server;
	stateService: StateService;
	teardown: () => void;
}
