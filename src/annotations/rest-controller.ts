import express from 'express';
import { Container } from 'final-di';
import { RestApplication } from '../classes';

import { ConstructorType, HttpMethod, INJECTION_TOKEN, RestControllerInjecting } from '../util';

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
    const returnValue = definition.onRequestFn(body, params);
    res.json(returnValue);
  });
}

export function RestController(config: RestControllerConfig = {}): any {
  return (target: ConstructorType, ...args: any[]) => {
    const defaultMethod = config.defaultMethod || 'get';
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
