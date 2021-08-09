import 'reflect-metadata';
import express from 'express';
import { Container, Inject } from 'final-di';

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
  name?: string;
}

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'all';

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

const requestControllerMap: { [controllerName: string]: RequestDefinition[] } = {};

// const defaultConfig: RequestMappingConfig = {
//   method: 'get'
// };

export function OnRequest(path?: string, config: RequestMappingConfig = {}): any {
  // console.log('called RequestMapping with', path, config);
  return (target: ConstructorType, propertyKey: string, descriptor: PropertyDescriptor) => {
    // console.log('target:', target, target.name, target.prototype, target.constructor?.name);
    path = propertyKey === 'index' ? '/' : path;
    path = path ?? `/${propertyKey}`;

    const requestDefinition = {
      path,
      config,
      onRequestFn: (body: any, params: any) => descriptor.value(body, params)
    };
    if (requestControllerMap[target.constructor?.name]) {
      requestControllerMap[target.constructor.name].push(requestDefinition);
    } else {
      requestControllerMap[target.constructor.name] = [requestDefinition];
    }
  };
}

export function OnPost(path?: string, config: RequestMappingConfig = {}): any {
  return OnRequest(path, { ...config, method: 'post' });
}

export function OnGet(path?: string, config: RequestMappingConfig = {}): any {
  return OnRequest(path, { ...config, method: 'get' });
}

export function OnDelete(path?: string, config: RequestMappingConfig = {}): any {
  return OnRequest(path, { ...config, method: 'delete' });
}

export function OnPut(path?: string, config: RequestMappingConfig = {}): any {
  return OnRequest(path, { ...config, method: 'put' });
}

export function OnAll(path?: string, config: RequestMappingConfig = {}): any {
  return OnRequest(path, { ...config, method: 'all' });
}

export function RestController(config: RestControllerConfig = {}): any {
  // console.log('called rest-controller', config);
  return (target: ConstructorType, ...args: any[]) => {
    // console.log('args:', target, target.prototype, target.name, args, Object.keys(target));
    // for (const key in target) {
    //   console.log('target has key:', key, (target as any)[key]);
    // }
    const defaultMethod = config.defaultMethod || 'get';
    const app = Container.getInstance().getService<express.Application>(INJECTION_TOKEN);
    (target as any).defaultMethod = defaultMethod;
    (target as any).app = app;
    Container.getInstance().register<RestControllerInjecting>(target, target);
    const requestMethods = requestControllerMap[target.name] || [];
    for (const method of requestMethods) {
      method.config.method = method.config.method ?? defaultMethod;
      // console.log('defaultMethod', defaultMethod);
      method.path = config.prefix
        ? `/${config.prefix}/${method.path.startsWith('/') ? method.path.slice(1) : method.path}`
        : method.path;
      onConstructRequest(app, method);
    }
  };
}

function onConstructRequest(app: express.Application, definition: RequestDefinition): void {
  app[definition.config.method!](definition.path, (req, res) => {
    const params = req.params;
    const body = req.body;
    // console.log('body', body);
    const returnValue = definition.onRequestFn(body, params);
    res.json(returnValue);
  });
}

export class RestApplication {
  @Inject({
    name: INJECTION_TOKEN,
    useValue: express(),
    afterInit: (app: express.Application) => {
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
    }
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
}
