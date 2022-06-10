export interface LoggerConfiguration {
  logFn?: (...args: any[]) => void;
  infoFn?: (...args: any[]) => void;
  debugFn?: (...args: any[]) => void;
  errorFn?: (...args: any[]) => void;
}

export class Logger {
  private static _hasInitialized = false;

  private static _logFn: (...args: any[]) => void;
  private static _infoFn: (...args: any[]) => void;
  private static _errorFn: (...args: any[]) => void;
  private static _debugFn: (...args: any[]) => void;

  public static construct(config: LoggerConfiguration = {}): void {
    if (this._hasInitialized) {
      throw new Error(`A logger instance was already initialized`);
    }
    this._logFn = (...args: any[]) => (config.logFn ? config.logFn(...args) : console.log(...args));
    this._infoFn = (...args: any[]) => (config.infoFn ? config.infoFn(...args) : this._logFn(...args));
    this._debugFn = (...args: any[]) => (config.debugFn ? config.debugFn(...args) : this._logFn(...args));
    this._errorFn = (...args: any[]) => (config.errorFn ? config.errorFn(...args) : this._logFn(...args));
    this._hasInitialized = true;
  }

  public static info(message?: any, ...args: any[]): void {
    if (!this._hasInitialized) {
      throw new Error(`A logger has not been initialized yet`);
    }
    this._infoFn(message, ...args);
  }

  public static error(message?: any, ...args: any[]): void {
    if (!this._hasInitialized) {
      throw new Error(`A logger has not been initialized yet`);
    }
    this._errorFn(message, ...args);
  }

  public static debug(message?: any, ...args: any[]): void {
    if (!this._hasInitialized) {
      throw new Error(`A logger has not been initialized yet`);
    }
    this._debugFn(message, ...args);
  }
}
