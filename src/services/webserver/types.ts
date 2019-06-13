export interface ServerConfig {
  baseURL: string;
  port: number;
}

export interface Link {
  href: string;
  rel: string;
}
export type LinkList = Array<Link>;
