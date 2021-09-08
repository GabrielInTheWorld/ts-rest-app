import { Response } from 'express';
import { Inject } from 'final-di';

import { OnGet, OnPost, OnRequest, RestController } from '../src/annotations';
import { Body, Res } from '../src/annotations/parameters';
import { RoutingError } from '../src/exceptions/routing-error';

import { TestMiddleware } from './test-middleware';
import { TEST_WORLD } from './utils';
import { TestHandler } from './test-handler';

@RestController({
  defaultMethod: 'get'
})
export class TestController {
  @Inject(TestHandler)
  private readonly testHandler: TestHandler;

  private readonly TEST_WORLD = TEST_WORLD;

  public constructor() {}

  @OnRequest()
  public index(): string {
    return 'Hello World!';
  }

  @OnPost()
  public data(@Body('message') data: string): string {
    return data;
  }

  @OnRequest()
  public info(@Res() res: Response): string {
    res.cookie('a-cookie', 'hello_world');
    return 'This is an info route';
  }

  @OnRequest()
  public error(): void {
    throw new Error('An unknown, suspicious and unexpectular error occurred');
  }

  @OnRequest('routing-error')
  public routingError(): void {
    throw new RoutingError('This route is not for your eyes', { statusCode: 403 });
  }

  @OnRequest('promise', { middleware: [TestMiddleware] })
  public async promise(): Promise<string> {
    return 'A promise is resolved';
  }

  @OnGet('test-world')
  public testWorld(): string {
    return this.TEST_WORLD;
  }

  @OnPost()
  public login(@Body('username') username: string, @Body('password') password: string): string {
    console.log('testHandler', this.testHandler);
    return this.testHandler.login(username, password);
  }

  @OnGet('on-error')
  public onError(): void {
    this.testHandler.throwException();
  }

  @OnGet('on-deep-error')
  public onDeepError(): void {
    this.testHandler.throwDeepException();
  }

  @OnPost('deep-promise')
  public async deepPromise(@Body('username') username: string, @Body('password') password: string): Promise<string[]> {
    return [await this.testHandler.lazyLogin(username, password)];
  }
}

@RestController({
  prefix: 'secure',
  middleware: [TestMiddleware]
})
export class SecureTestController {
  @OnPost()
  public data(@Body() _data: any): string {
    return 'Yeah, a secure data route!';
  }

  @OnGet('test-middleware')
  public testMiddlewareFn(): string {
    return 'You have used a middleware for a specific function';
  }
}
