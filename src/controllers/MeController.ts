import { PromiseRejectionHandler } from 'common';
import User from 'entities/User';
import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import UserService from '../services/UserService';

class MeController {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  init() {
    this.router.get('/', PromiseRejectionHandler(this.getUserData));
  }

  private async getUserData(req: Request, res: Response) {
    const requestUser = req.user;
    const user = await UserService.findById(requestUser.id);

    if (!user) return res.sendStatus(StatusCodes.UNAUTHORIZED);

    return res.status(StatusCodes.OK).send(user);
  }
}

export default new MeController().router;
