import { Logger, PromiseRejectionHandler } from 'common';
import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sign } from 'jsonwebtoken';
import LoginService from '../services/LoginService';

const logger = Logger(__filename);

class LoginController {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  init() {
    this.router.post('/', PromiseRejectionHandler(this.login));
  }

  private async login(req: Request, res: Response) {
    logger.info('POST /login called');

    const { email, password } = req.body;

    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: ['email_is_required'],
      });
    }

    if (!password) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: ['password_is_required'],
      });
    }

    try {
      const user = await LoginService.authenticateLogin(
        email as string,
        password as string
      );

      if (user) {
        const accessToken = sign(
          {
            id: user.id,
          },
          `${process.env.JWT_TOKEN_SECRET}`
        );

        delete user.password;

        logger.info(`POST /login status code: ${StatusCodes.OK}`);
        return res
          .status(StatusCodes.OK)
          .send({ login: 'success', token: accessToken, user });
      } else {
        return res.status(StatusCodes.BAD_REQUEST).send({
          errors: ['user_not_found'],
        });
      }
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: [error.message],
      });
    }
  }
}

export default new LoginController().router;
