export class TestHandler {
  public login(username: string, password: string): string {
    return `${username}_${password}`;
  }
}
