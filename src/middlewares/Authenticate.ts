import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret, verify } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

declare module 'express' {
  interface Request {
    user?: any;
  }
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const accessToken: Secret | undefined = req.header('access_token');

  if (!accessToken) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ error: 'User does not logged in!' });
  } else {
    try {
      const secret: string | undefined = process.env.JWT_TOKEN_SECRET;

      if (secret) {
        const validToken = verify(accessToken, secret);

        req.user = validToken;

        if (validToken) {
          return next();
        }
      }
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).send({ error: error.message });
    }
  }
};

export { authenticate };
