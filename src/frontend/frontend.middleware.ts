import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { join } from 'path';

export class FrontendMiddleware implements NestMiddleware {
  private readonly FRONTEND_ROOT = join(__dirname, '../../frontend');

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile('index.html', { root: this.FRONTEND_ROOT }, (err) => {
        if (err) next(err);
      });
    } else {
      next();
    }
  }
}
