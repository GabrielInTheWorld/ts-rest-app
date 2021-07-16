import { OnRequest, RestController } from './annotations';

@RestController()
export class TestController {
  @OnRequest()
  public index(): string {
    return 'Hello World!';
  }
}

export function Some(target: any, ...props: any[]): any {
  console.log('some.target', target, target.prototype, props);
}
