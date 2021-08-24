import { OnPost, OnRequest, RestController } from '../src/annotations';

@RestController({
  defaultMethod: 'get'
})
export class TestController {
  public constructor() {
    console.log('TestController');
  }

  @OnRequest()
  public index(): string {
    console.log('TestController:index');
    return 'Hello World!';
  }

  @OnPost()
  public data(data: any): string {
    console.log('data', data);
    return 'Hello not';
  }
}

export function Some(target: any, ...props: any[]): any {
  console.log('some.target', target, target.prototype, props);
}
