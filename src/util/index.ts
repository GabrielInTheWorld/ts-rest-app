import { Request, Response } from 'express';

export const INJECTION_TOKEN = 'express.Application';

export interface ConstructorType<T = any> {
  new (...args: any[]): T;
  name: string;
  prototype: any;
}

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'all';

export interface RestControllerInjecting<T = any> extends ConstructorType<T> {
  defaultMethod: HttpMethod;
}

export type RequestHandlerFn = (req: Request, res?: Response) => void;
