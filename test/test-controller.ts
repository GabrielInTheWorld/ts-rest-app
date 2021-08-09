import { OnPost, OnRequest, RestController } from '../src/annotations';

@RestController({
  defaultMethod: 'post'
})
export class TestController {
  @OnRequest()
  public index(): string {
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
