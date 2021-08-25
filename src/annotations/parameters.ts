import { ConstructorType } from '../util';

export const BODY_METADATA_KEY = 'body_metadata_key';
export const PARAM_METADATA_KEY = 'param_metadata_key';
export const COOKIE_METADATA_KEY = 'cookie_metadata_key';

export const TYPE_BODY = 'body';
export const TYPE_COOKIE = 'cookie';
export const TYPE_PARAM = 'param';

export function Body(name?: string): any {
  return (target: ConstructorType, propertyKey: string, parameterIndex: number): void => {
    const existingBodyParams = Reflect.getOwnMetadata(BODY_METADATA_KEY, target, propertyKey) || [];
    existingBodyParams.push({ name: name, parameterIndex, type: TYPE_BODY });
    Reflect.defineMetadata(BODY_METADATA_KEY, existingBodyParams, target, propertyKey);
  };
}

export function Param(name: string): any {
  return (target: ConstructorType, propertyKey: string, parameterIndex: number): void => {
    const existingParameters = Reflect.getOwnMetadata(PARAM_METADATA_KEY, target, propertyKey) || [];
    existingParameters.push({ name, parameterIndex, type: TYPE_PARAM });
    Reflect.defineMetadata(PARAM_METADATA_KEY, existingParameters, target, propertyKey);
  };
}

export function Cookie(name: string): any {
  return (target: ConstructorType, propertyKey: string, parameterIndex: number): void => {
    const existingCookies = Reflect.getOwnMetadata(COOKIE_METADATA_KEY, target, propertyKey) || [];
    existingCookies.push({ name, parameterIndex, type: TYPE_COOKIE });
    Reflect.defineMetadata(COOKIE_METADATA_KEY, existingCookies, target, propertyKey);
  };
}
