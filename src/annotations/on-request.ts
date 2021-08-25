import { ConstructorType } from '../util/index';
import { requestControllerMap, RequestMappingConfig, RequestDefinition } from './rest-controller';
import {
  BODY_METADATA_KEY,
  PARAM_METADATA_KEY,
  COOKIE_METADATA_KEY,
  REQUEST_METADATA_KEY,
  RESPONSE_METADATA_KEY
} from './parameters';
import { Request, Response } from 'express';

interface TargetProperties {
  target: ConstructorType;
  propertyKey: string;
}

export interface RequestParams {
  body: any;
  cookies: any;
  params: any;
}

export interface RequestProperties {
  request: Request;
  response: Response;
}

interface Usage {
  name: string;
  parameterIndex: number;
  type: 'body' | 'cookie' | 'param' | 'response' | 'request';
}

function getFunctionParameterByUsage(usage: Usage, options: RequestParams & RequestProperties): any {
  const { body, cookies, params, request, response } = options;
  switch (usage.type) {
    case 'body':
      if (usage.name) {
        return body[usage.name];
      } else {
        return body;
      }
    case 'cookie':
      return cookies[usage.name];
    case 'param':
      return params[usage.name];
    case 'request':
      return request;
    case 'response':
      return response;
  }
}

async function getFunctionValue(
  descriptor: PropertyDescriptor,
  properties: TargetProperties,
  options: RequestParams & RequestProperties
): Promise<any> {
  const { target, propertyKey } = properties;
  const useBody: Usage[] = Reflect.getOwnMetadata(BODY_METADATA_KEY, target, propertyKey) || [];
  const useParams: Usage[] = Reflect.getOwnMetadata(PARAM_METADATA_KEY, target, propertyKey) || [];
  const useCookies: Usage[] = Reflect.getOwnMetadata(COOKIE_METADATA_KEY, target, propertyKey) || [];
  const useRequest: Usage = Reflect.getOwnMetadata(REQUEST_METADATA_KEY, target, propertyKey);
  const useResponse: Usage = Reflect.getOwnMetadata(RESPONSE_METADATA_KEY, target, propertyKey);
  const uses: Usage[] = useParams.concat(useCookies).concat(useBody);
  if (useRequest) {
    uses.push(useRequest);
  }
  if (useResponse) {
    uses.push(useResponse);
  }
  uses.sort((a, b) => a.parameterIndex - b.parameterIndex);
  const functionParams = uses.map(usage => {
    return getFunctionParameterByUsage(usage, options);
  });
  return await descriptor.value(...functionParams);
}

export function OnRequest(path?: string, config: RequestMappingConfig = {}): any {
  return (target: ConstructorType, propertyKey: string, descriptor: PropertyDescriptor) => {
    path = propertyKey === 'index' ? '/' : path;
    path = path ?? `/${propertyKey}`;
    path = path.startsWith('/') ? path : `/${path}`;

    const requestDefinition: RequestDefinition = {
      path,
      config,
      onRequestFn: async (properties, params) =>
        await getFunctionValue(descriptor, { target, propertyKey }, { ...properties, ...params })
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
