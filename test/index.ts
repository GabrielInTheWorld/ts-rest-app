import { Inject } from 'final-di';

import { TestClass, TestInterface } from './test-class';
import { TestController, SecureTestController } from './test-controller';
import { RestApplication } from '../src';

class Server {
  @Inject(TestClass)
  private test: TestInterface;
  private application = new RestApplication({
    controllers: [TestController, SecureTestController],
    port: 3000,
    requestHandlers: [
      req => {
        console.log(`A second handler is resolving: ${req.url}`);
      },
      () => {
        console.log('This one is called although next is not called');
      }
    ]
  });

  public start(): void {
    this.application.start();
  }
}

const server = new Server();
server.start();
