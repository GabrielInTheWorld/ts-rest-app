import { ConstructorType } from '../util';

export const BODY_METADATA_KEY = 'body_metadata_key';
export const PARAM_METADATA_KEY = 'param_metadata_key';
export const COOKIE_METADATA_KEY = 'cookie_metadata_key';
export const HEADER_METADATA_KEY = 'header_metadata_key'
export const REQUEST_METADATA_KEY = 'request_metadata_key';
export const RESPONSE_METADATA_KEY = 'response_metadata_key';

export const TYPE_BODY = 'body';
export const TYPE_PARAM = 'param';
export const TYPE_COOKIE = 'cookie';
export const TYPE_HEADER = 'header'
export const TYPE_REQUEST = 'request';
export const TYPE_RESPONSE = 'response';

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

export function Header(name: string): any {
  return (target: ConstructorType, propertyKey: string, parameterIndex: number): void => {
    const existingHeaders = Reflect.getOwnMetadata(HEADER_METADATA_KEY, target, propertyKey) || []
    existingHeaders.push({name, parameterIndex, type: TYPE_HEADER})
    Reflect.defineMetadata(HEADER_METADATA_KEY, existingHeaders, target, propertyKey)
  }
}

export function Req(): any {
  return (target: ConstructorType, propertyKey: string, parameterIndex: number): void => {
    const reflectionData = { name: propertyKey, parameterIndex, type: TYPE_REQUEST };
    Reflect.defineMetadata(REQUEST_METADATA_KEY, reflectionData, target, propertyKey);
  };
}

export function Res(): any {
  return (target: ConstructorType, propertyKey: string, parameterIndex: number): void => {
    const reflectionData = { name: propertyKey, parameterIndex, type: TYPE_RESPONSE };
    Reflect.defineMetadata(RESPONSE_METADATA_KEY, reflectionData, target, propertyKey);
  };
}
