import { NextFunction, Request, Response } from 'express';

export default (
  fn: (
    req: Request,
    res: Response,
    next: NextFunction,
    ...args: { length: number }[]
  ) => void
) => {
  return function asyncUntilWrap(
    req: Request,
    res: Response,
    next: NextFunction,
    ...args: { length: number }[]
  ): Promise<void> {
    const functionReturn = fn(req, res, next, ...args);

    return Promise.resolve(functionReturn).catch(next);
  };
};
