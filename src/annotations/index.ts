import 'reflect-metadata';
import express from 'express';
import { Container, Inject } from '../example';

const INJECTION_TOKEN = 'express.Application';

interface ConstructorType<T = any> {
  new (...args: any[]): T;
  name: string;
  prototype: any;
}

interface RestControllerInjecting<T = any> extends ConstructorType<T> {
  defaultMethod: HttpMethod;
}

export interface RestApplicationConfig {
  controllers: ConstructorType[];
  port?: number;
  shouldImmediatelyStart?: boolean;
}

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'all';

export interface RequestMappingConfig {
  method: HttpMethod;
}

export interface RestControllerConfig {
  defaultMethod?: HttpMethod;
  prefix?: string;
}

const defaultConfig: RequestMappingConfig = {
  method: 'get'
};
export function OnRequest(path?: string, config: RequestMappingConfig = defaultConfig): any {
  console.log('called RequestMapping with', path, config);
  return (target: ConstructorType, propertyKey: string, descriptor: PropertyDescriptor) => {
    console.log('target:', target, target.name, target.prototype, target.constructor?.name);
    // const controller = Container.getInstance().getService(target.name) as any;
    const app: express.Application = Container.getInstance().getService({ name: INJECTION_TOKEN, useValue: express() });
    const routePath = path || `/${propertyKey}`;
    app[config.method](routePath, (req, res) => {
      const params = req.params;
      const body = req.body;
      const response = descriptor.value(body, params);
      res.json(response);
    });
  };
}

export function OnPost(path: string, config: RequestMappingConfig): any {
  return OnRequest(path, { ...config, method: 'post' });
}

export function OnGet(path: string, config: RequestMappingConfig): any {
  return OnRequest(path, { ...config, method: 'get' });
}

export function OnDelete(path: string, config: RequestMappingConfig): any {
  return OnRequest(path, { ...config, method: 'delete' });
}

export function OnPut(path: string, config: RequestMappingConfig): any {
  return OnRequest(path, { ...config, method: 'put' });
}

export function OnAll(path: string, config: RequestMappingConfig): any {
  return OnRequest(path, { ...config, method: 'all' });
}

export function RestController(config: RestControllerConfig = {}): any {
  console.log('called rest-controller', config);
  return (target: ConstructorType, ...args: any[]) => {
    console.log('args:', target, args, Object.keys(target));
    for (const key in target) {
      console.log('target has key:', key, (target as any)[key]);
    }
    const defaultMethod = config.defaultMethod || 'get';
    (target as any).defaultMethod = defaultMethod;
    (target as any).app = Container.getInstance().getService(INJECTION_TOKEN);
    Container.getInstance().register<RestControllerInjecting>(target, target);
  };
}

export class RestApplication {
  @Inject({
    name: INJECTION_TOKEN,
    useValue: express()
  })
  private readonly app: express.Application;
  private config: RestApplicationConfig;

  public constructor(config: RestApplicationConfig) {
    this.config = config;
    if (config.shouldImmediatelyStart) {
      this.start();
    }
  }

  public start(): void {
    const port = this.config.port || 80;
    this.app.listen(port, () => {
      console.log(`This server is listen on port ${port}.`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getConfig(): Readonly<RestApplicationConfig> {
    return this.config;
  }
}
