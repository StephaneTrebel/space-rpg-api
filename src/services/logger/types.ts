export enum LogLevel {
	EMERG = 'emerg',
	ALERT = 'alert',
	CRIT = 'crit',
	ERROR = 'error',
	WARNING = 'warning',
	NOTICE = 'notice',
	INFO = 'info',
	DEBUG = 'debug',
}
export interface LoggerConfig {
	combinedFile: boolean;
	console: boolean;
	disabled: boolean;
	errorFile: boolean;
	format: boolean;
	level: LogLevel;
}

type Logger = (x: any) => void;

export interface LoggerService {
	emerg: Logger;
	alert: Logger;
	crit: Logger;
	error: Logger;
	warning: Logger;
	notice: Logger;
	info: Logger;
	debug: Logger;
}
