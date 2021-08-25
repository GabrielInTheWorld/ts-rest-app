import { OnPost, OnRequest, RestController } from '../src/annotations';
import { Body } from '../src/annotations/parameters';
import { RoutingError } from '../src/exceptions/routing-error';

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
  public data(@Body() data: any): string {
    console.log('data', data);
    return 'Hello not';
  }

  @OnRequest()
  public error(): void {
    throw new Error('An unknown, suspicious and unexpectular error occurred');
  }

  @OnRequest('routing-error')
  public routingError(): void {
    throw new RoutingError('This route is not for your eyes', { statusCode: 403 });
  }
}

export function Some(target: any, ...props: any[]): any {
  console.log('some.target', target, target.prototype, props);
}
