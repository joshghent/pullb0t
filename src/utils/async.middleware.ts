import { NextFunction, Request, Response } from "express";

// If a promise is rejected, this middleware catches it and forwards the request onto the Express error handler
export const asyncMiddleware = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next))
    .catch(next);
};
