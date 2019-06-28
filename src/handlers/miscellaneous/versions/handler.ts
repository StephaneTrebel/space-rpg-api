import { ConfigService } from '../../../services/config/types';
import { Handler } from '../../../services/openapi-backend/types';
import { Link } from '../../../services/webserver/types';
import { wrapHandler } from '../../../services/openapi-backend/service';
import { LoggerService } from '../../../services/logger/types';

export const VERSIONS_LINK: Link = {
  href: '/versions',
  rel: 'versions',
};

type GetVersions = (deps: {
  configService: ConfigService;
  loggerService: LoggerService;
}) => Handler;
export const getVersions: GetVersions = ({ configService, loggerService }) =>
  wrapHandler({ loggerService })(() => ({
    json: {
      'space-rpg-api': configService.getVersions()['space-rpg-api'],
    },
    status: 200,
  }));
