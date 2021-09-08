import { BaseError } from '../src/exceptions/base-error';

export class TestException extends BaseError {
  public constructor() {
    super('TestException', { statusCode: 404 });
  }
}

export class TestDeepException extends BaseError {
  public constructor(message: string) {
    super(message, { statusCode: 403 });
  }
}
