export interface HandlerResponse {
	status: number;
	json: any;
}

export type Handler = (context: any) => HandlerResponse;
