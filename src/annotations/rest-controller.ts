import express, { Handler, Request, Response } from 'express';
import { Container } from 'final-di';

import { ConstructorType, HttpMethod, RestControllerInjecting } from '../util';
import { initExpressApplication } from '../util/declarative-functions';
import { BaseError, RoutingError } from '../exceptions';
import { RestMiddleware } from '../interfaces/rest-middleware';
import { RequestProperties, RequestParams } from './on-request';

export const requestControllerMap: { [controllerName: string]: RequestDefinition[] } = {};

export interface RequestMappingConfig {
  method?: HttpMethod;
  middleware?: ConstructorType<RestMiddleware>[];
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
  const middlewareHandlers = (definition.config.middleware || []).map(middlewareCtor => getMiddleware(middlewareCtor));
  app[definition.config.method!](definition.path, ...middlewareHandlers, (req, res) => {
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

function getMiddleware(middlewareCtor: ConstructorType<RestMiddleware>): Handler {
  const middleware = Container.get(middlewareCtor);
  return (req, res, next) => middleware.use(req, res, next);
}

function applyMiddleware(app: express.Application, config: RestControllerConfig): void {
  const { prefix, middleware: middlewareCtors = [] } = config;
  if (!middlewareCtors.length) {
    return;
  }
  const middlewareHandlers = middlewareCtors.map(middlewareCtor => getMiddleware(middlewareCtor));
  app.all(prefix ? `/${prefix}/*` : '/*', ...middlewareHandlers);
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
    Container.register<RestControllerInjecting>(target, target);
    const requestMethods = requestControllerMap[target.name] || [];
    applyMiddleware(app, config);
    applyRequestMethods(app, requestMethods, config);
  };
}
