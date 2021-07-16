// import express from 'express';
import { RestApplication } from './annotations';
import { TestController } from './test-controller';

class Server {
  // public static readonly PORT = 3000;

  // private app = express();

  // public start(): void {
  //   this.app.get('/', (req, res) => res.json({ message: 'success' }));

  //   this.app.listen(Server.PORT, () => {
  //     console.log(`Server is running on port ${Server.PORT}`);
  //   });
  // }
  private application = new RestApplication({
    controllers: [TestController],
    port: 3000
  });

  public start(): void {
    this.application.start();
    // this.application.start({
    //   controllers: [TestController],
    //   port: 3000
    // });
  }
}

const server = new Server();
server.start();
