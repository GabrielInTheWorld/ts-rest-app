import { Request, Response, NextFunction } from 'express';

export interface RestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void | Promise<void>;
}
