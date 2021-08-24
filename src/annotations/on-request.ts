import { ConstructorType } from '../util/index';
import { requestControllerMap, RequestMappingConfig } from './rest-controller';

export function OnRequest(path?: string, config: RequestMappingConfig = {}): any {
  return (target: ConstructorType, propertyKey: string, descriptor: PropertyDescriptor) => {
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
