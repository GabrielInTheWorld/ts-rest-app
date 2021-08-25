import { ConstructorType } from '../util/index';
import { requestControllerMap, RequestMappingConfig, RequestDefinition } from './rest-controller';
import { BODY_METADATA_KEY, PARAM_METADATA_KEY, COOKIE_METADATA_KEY } from './parameters';

interface TargetProperties {
  target: ConstructorType;
  propertyKey: string;
}

interface RequestParams {
  body: any;
  cookies: any;
  params: any;
}

interface Usage {
  name: string;
  parameterIndex: number;
  type: 'body' | 'cookie' | 'param';
}

function getFunctionValue(descriptor: PropertyDescriptor, properties: TargetProperties, options: RequestParams): any {
  const { body, cookies, params } = options;
  const { target, propertyKey } = properties;
  const useBody: Usage = Reflect.getOwnMetadata(BODY_METADATA_KEY, target, propertyKey);
  const useParams: Usage[] = Reflect.getOwnMetadata(PARAM_METADATA_KEY, target, propertyKey) || [];
  const useCookies: Usage[] = Reflect.getOwnMetadata(COOKIE_METADATA_KEY, target, propertyKey) || [];
  const uses: Usage[] = useParams.concat(useCookies);
  if (useBody) {
    uses.push(useBody);
  }
  uses.sort((a, b) => a.parameterIndex - b.parameterIndex);
  const functionParams = uses.map(usage => {
    switch (usage.type) {
      case 'body':
        return body;
      case 'cookie':
        return cookies[usage.name];
      case 'param':
        return params[usage.name];
    }
  });
  return descriptor.value(...functionParams);
}

export function OnRequest(path?: string, config: RequestMappingConfig = {}): any {
  return (target: ConstructorType, propertyKey: string, descriptor: PropertyDescriptor) => {
    path = propertyKey === 'index' ? '/' : path;
    path = path ?? `/${propertyKey}`;
    path = path.startsWith('/') ? path : `/${path}`;

    const requestDefinition: RequestDefinition = {
      path,
      config,
      onRequestFn: (body: any, params: any, cookies: any) =>
        getFunctionValue(descriptor, { target, propertyKey }, { body, params, cookies })
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
