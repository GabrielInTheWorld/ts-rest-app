// import express from 'express';
import { RestApplication } from '../src/annotations';
import { Inject } from './example';
import { TestClass, TestInterface } from './test-class';
import { TestController } from './test-controller';

class Server {
  @Inject(TestClass)
  private test: TestInterface;
  private application = new RestApplication({
    controllers: [TestController],
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
