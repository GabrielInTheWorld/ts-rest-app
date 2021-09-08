import { TestDeepException } from './test-exception';
import { LoginData, LOGIN_DATA } from './utils';
export class TestHandlerWithException {
  public getLoginData(): LoginData {
    this.throwError();
    return LOGIN_DATA;
  }

  private throwError(): void {
    throw new TestDeepException('Fatal error');
  }
}
