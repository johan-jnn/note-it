import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { join } from 'path';

export class FrontendMiddleware implements NestMiddleware {
  private readonly FRONTEND_ROOT = join(__dirname, '../../../frontend');

  use(req: Request, res: Response, next: NextFunction) {
    if (req.path.startsWith('/api')) {
      return next();
    }

    // If we want a html document, we force sending the index.html file (as we're in serve a spa/static frontend)
    const file = req.accepts().includes('text/html') ? 'index.html' : req.path;
    res.sendFile(file, { root: this.FRONTEND_ROOT }, (err) => {
      if (err) next(err);
    });
  }
}
