declare module 'final-di' {
  export class Container {
    private constructor();
    public static getInstance(): Container;
    public register<T>(name: any, provider: any): void;
    public getService<T>(name: InjectionToken): T;
  }

  export function Inject(key: any): any;
  export type InjectionToken = string | { name: string; useValue?: any } | (new (...args: any[]) => any);
}
