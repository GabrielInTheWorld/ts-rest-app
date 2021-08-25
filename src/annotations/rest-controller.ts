import express, { Request, Response } from 'express';
import { Container } from 'final-di';

import { ConstructorType, HttpMethod, RestControllerInjecting } from '../util';
import { initExpressApplication } from '../util/declarative-functions';
import { BaseError, RoutingError } from '../exceptions';
import { RestMiddleware } from '../interfaces/rest-middleware';
import { RequestProperties, RequestParams } from './on-request';

export const requestControllerMap: { [controllerName: string]: RequestDefinition[] } = {};

export interface RequestMappingConfig {
  method?: HttpMethod;
}

export interface RestControllerConfig {
  defaultMethod?: HttpMethod;
  prefix?: string;
  middleware?: ConstructorType<RestMiddleware>[];
}

export interface RequestDefinition {
  path: string;
  config: RequestMappingConfig;
  onRequestFn: (properties: RequestProperties, params: RequestParams) => Promise<any>;
}

function onConstructRequest(app: express.Application, definition: RequestDefinition): void {
  app[definition.config.method!](definition.path, (req, res) => {
    sendJson(definition, req, res).catch(e => catchError(res, e));
  });
}

async function sendJson(definition: RequestDefinition, request: Request, response: Response): Promise<void> {
  const params = request.params;
  const body = request.body;
  const cookies = request.cookies;
  const result = await definition.onRequestFn({ request, response }, { body, params, cookies });
  response.json(result);
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

function applyMiddleware(app: express.Application, middlewareCtors: ConstructorType<RestMiddleware>[]): void {
  for (const middlewareCtor of middlewareCtors) {
    const middleware = Container.getInstance().getService(middlewareCtor);
    app.use((req, res, next) => {
      middleware.use(req, res, next);
    });
  }
}

function applyRequestMethods(
  app: express.Application,
  requestMethods: RequestDefinition[],
  config: RestControllerConfig
): void {
  const defaultMethod = config.defaultMethod || 'get';
  for (const method of requestMethods) {
    method.config.method = method.config.method ?? defaultMethod;
    method.path = config.prefix
      ? `/${config.prefix}/${method.path.startsWith('/') ? method.path.slice(1) : method.path}`
      : method.path;
    onConstructRequest(app, method);
  }
}

export function RestController(config: RestControllerConfig = {}): any {
  return (target: ConstructorType) => {
    const app: express.Application = initExpressApplication();
    Container.getInstance().register<RestControllerInjecting>(target, target);
    const requestMethods = requestControllerMap[target.name] || [];
    applyMiddleware(app, config.middleware || []);
    applyRequestMethods(app, requestMethods, config);
  };
}
