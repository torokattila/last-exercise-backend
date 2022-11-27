import { Logger, PromiseRejectionHandler } from 'common';
import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sign } from 'jsonwebtoken';
import UserService from '../services/UserService';

const logger = Logger(__filename);

class RegistrationController {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  init() {
    this.router.post('/', PromiseRejectionHandler(this.register));
  }

  private async register(req: Request, res: Response) {
    logger.info(`POST /register called`);

    const data = req.body;

    if (!data.password) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: ['password_required'],
      });
    }

    if (!data.passwordConfirm) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: ['password_confirm_required'],
      });
    }

    if (
      !UserService.validatePasswordMatch(data.password, data.passwordConfirm)
    ) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: ['passwords_must_match'],
      });
    }

    if (
      !data.firstname ||
      !data.lastname ||
      !data.firstname.trim().length ||
      !data.lastname.trim().length
    ) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: ['firstname_and_lastname_required'],
      });
    }

    const existingEmail = await UserService.findByEmail(data.email);

    if (existingEmail) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: ['email_already_exist'],
      });
    }

    delete data.passwordConfirm;
    data.password = await UserService.generateHash(data.password);

    const user = await UserService.save(data);
    const secret: string | undefined = process.env.JWT_TOKEN_SECRET;

    delete user.password;

    if (secret) {
      const accessToken = sign({ id: user.id }, secret);

      logger.info(`POST /register status code: ${StatusCodes.OK}`);
      return res.status(StatusCodes.OK).send({
        token: accessToken,
        user,
      });
    }
  }
}

export default new RegistrationController().router;
