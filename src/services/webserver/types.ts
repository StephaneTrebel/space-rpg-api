export enum Protocol {
  HTTP = 'http',
}
export interface ServerConfig {
  host: string;
  port: number;
  protocol: Protocol;
}

export interface Link {
  href: string;
  rel: string;
}
export type LinkList = Array<Link>;
