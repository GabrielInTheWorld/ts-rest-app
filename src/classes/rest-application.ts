import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from 'express';
import { Container, Inject } from 'final-di';

import { ConstructorType, ErrorHandlerFn, INJECTION_TOKEN, RequestHandlerFn } from '../util';
import { Logger, LoggerConfiguration } from './logger';

export interface RestApplicationConfig {
  controllers: ConstructorType[];
  port?: number;
  shouldImmediatelyStart?: boolean;
  name?: string;
  requestHandlers?: RequestHandlerFn[];
  errorHandlers?: ErrorHandlerFn[];
  logger?: LoggerConfiguration;
}

export class RestApplication {
  @Inject({
    name: INJECTION_TOKEN,
    useValue: express(),
    afterInit: (app: express.Application) => {
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.use(cookieParser());
      app.use(RestApplication.handleRequest);
    }
  })
  private readonly _app: express.Application;
  private readonly _config: RestApplicationConfig;
  private static _requestHandlers: RequestHandlerFn[] = [];
  private static _errorHandlers: ErrorHandlerFn[] = [];

  public constructor(config: RestApplicationConfig) {
    this._config = config;
    RestApplication._requestHandlers = config.requestHandlers || [];
    RestApplication._errorHandlers = config.errorHandlers || [];
    RestApplication.registerErrorHandlers();
    Logger.construct(config.logger);
    if (config.shouldImmediatelyStart) {
      this.start();
    }
  }

  public start(): void {
    const port = this._config.port || 80;
    const name = this._config.name || 'This server';
    this._app.listen(port, () => {
      Logger.info(`${name} is listening on port ${port}.`);
    });
  }

  public getApp(): express.Application {
    return this._app;
  }

  public getConfig(): Readonly<RestApplicationConfig> {
    return this._config;
  }

  public static handleRequest(req: Request, res: Response, next: NextFunction): void {
    RestApplication._requestHandlers.forEach(handler => handler(req, res, next));
    next();
  }

  private static registerErrorHandlers(): void {
    Container.register(`ErrorToken`, this._errorHandlers);
  }
}
