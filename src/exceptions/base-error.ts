interface BaseErrorOptions {
  statusCode?: number;
}

export abstract class BaseError extends Error {
  public readonly statusCode: number;

  public constructor(message: string, { statusCode = 200 }: BaseErrorOptions = {}) {
    super(message);
    this.statusCode = statusCode;
  }
}
