import { Request, Response, NextFunction } from 'express';

// Definición del middleware asíncrono para manejar errores de manera centralizada
const asyncMiddleware = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncMiddleware;
