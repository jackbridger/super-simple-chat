import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err.stack);

  res.status(500);
  res.json({ error: err.message || 'An error occurred during the request.' });
}
