import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from 'express';
import { Inject } from 'final-di';

import { ConstructorType, INJECTION_TOKEN, RequestHandlerFn } from '../util';

export interface RestApplicationConfig {
  controllers: ConstructorType[];
  port?: number;
  shouldImmediatelyStart?: boolean;
  name?: string;
  requestHandlers?: RequestHandlerFn[];
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
  private readonly app: express.Application;
  private config: RestApplicationConfig;
  private static requestHandlers: RequestHandlerFn[] = [];

  public constructor(config: RestApplicationConfig) {
    this.config = config;
    RestApplication.requestHandlers = config.requestHandlers || [];
    if (config.shouldImmediatelyStart) {
      this.start();
    }
  }

  public start(): void {
    const port = this.config.port || 80;
    const name = this.config.name || 'This server';
    this.app.listen(port, () => {
      console.log(`${name} is listen on port ${port}.`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getConfig(): Readonly<RestApplicationConfig> {
    return this.config;
  }

  public static handleRequest(req: Request, res: Response, next: NextFunction): void {
    RestApplication.requestHandlers.forEach(handler => handler(req, res, next));
    next();
  }
}
