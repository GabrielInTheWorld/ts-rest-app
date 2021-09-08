import { TestDeepException } from './test-exception';
import { TestHandlerWithException } from './test-handler-with-exception';
import { LoginData } from './utils';
export class TestHandler {
  private readonly testHandlerWithException = new TestHandlerWithException();

  public login(username: string, password: string): string {
    return `${username}_${password}`;
  }

  public async lazyLogin(username: string, password: string): Promise<string> {
    return new Promise(resolve => {
      return resolve(`${username}_${password}`);
    });
  }

  public throwException(): void {
    throw new TestDeepException('Deep exception');
  }

  public throwDeepException(): LoginData {
    return this.testHandlerWithException.getLoginData();
  }
}
