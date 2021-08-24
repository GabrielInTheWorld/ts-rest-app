import express, { Response } from 'express';
import { Container } from 'final-di';
import { RestApplication } from '../classes';

import { ConstructorType, HttpMethod, INJECTION_TOKEN, RestControllerInjecting } from '../util';
import { BaseError, RoutingError } from '../exceptions';

export const requestControllerMap: { [controllerName: string]: RequestDefinition[] } = {};

export interface RequestMappingConfig {
  method?: HttpMethod;
}

export interface RestControllerConfig {
  defaultMethod?: HttpMethod;
  prefix?: string;
}

interface RequestDefinition {
  path: string;
  config: RequestMappingConfig;
  onRequestFn: (body: any, params: any) => any;
}

function onConstructRequest(app: express.Application, definition: RequestDefinition): void {
  app[definition.config.method!](definition.path, (req, res) => {
    const params = req.params;
    const body = req.body;
    try {
      res.json(definition.onRequestFn(body, params));
    } catch (e: unknown) {
      catchError(res, e);
    }
  });
}

function catchError(res: Response, e: unknown): void {
  console.log('Stacktrace:\r\n', e);
  if (e instanceof RoutingError) {
    res.status(e.statusCode).json({ message: e.message ?? 'URL not found' });
  } else if (e instanceof BaseError) {
    res.status(e.statusCode).json({ message: e.message ?? 'Action could not be addressed' });
  } else {
    const message = (e as any).toString() ?? 'Action handling failured';
    res.status(500).json({ message });
  }
}

function initExpressApplication(): express.Application {
  let app: express.Application;
  try {
    app = Container.getInstance().getService<express.Application>(INJECTION_TOKEN);
  } catch (e) {
    app = express();
    const injectionToken = {
      name: INJECTION_TOKEN,
      useValue: app,
      afterInit: (app: express.Application) => {
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(RestApplication.handleRequest);
      }
    };
    Container.getInstance().register(injectionToken, injectionToken as any);
  }
  return app;
}

export function RestController(config: RestControllerConfig = {}): any {
  return (target: ConstructorType, ...args: any[]) => {
    const defaultMethod = config.defaultMethod || 'get';
    const app: express.Application = initExpressApplication();
    (target as any).defaultMethod = defaultMethod;
    (target as any).app = app;
    Container.getInstance().register<RestControllerInjecting>(target, target);
    const requestMethods = requestControllerMap[target.name] || [];
    for (const method of requestMethods) {
      method.config.method = method.config.method ?? defaultMethod;
      method.path = config.prefix
        ? `/${config.prefix}/${method.path.startsWith('/') ? method.path.slice(1) : method.path}`
        : method.path;
      onConstructRequest(app, method);
    }
  };
}
