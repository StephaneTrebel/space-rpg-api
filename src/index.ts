import fs from 'fs';

import cors from 'cors';
import express from 'express';
import * as yaml from 'js-yaml';
import OpenAPIBackend from 'openapi-backend';

const specification = yaml.safeLoad(fs.readFileSync('openapi.yaml', 'utf8'));

const api = new OpenAPIBackend({
  definition: specification,
  handlers: {
    validationFail: (c: any, _req: any, res: any) => {
      console.log(c.validation.errors);
      res.status(400).json({ err: c.validation.errors });
    },
    notFound: (_c: any, _req: any, res: any) => {
      res.status(404).json({ err: 'not found' });
    },
    notImplemented: (c: any, _req: any, res: any) => {
      const { status, mock } = c.api.mockResponseForOperation(
        c.operation.operationId,
      );
      res.body = mock;
      res.status = status;
    },
  },
  ajvOpts: { unknownFormats: ['int32', 'int64'] },
});

api.init();

const app = express();

app.use(express.json());
app.use(cors());

app.use((req: any, res: any) => api.handleRequest(req, req, res));
app.listen(9000);
