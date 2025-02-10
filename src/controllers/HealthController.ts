import { Request, Response, Router } from 'express';
import { Logger } from '../common';
import { StatusCodes } from 'http-status-codes';

const logger = Logger(__filename);

class HealthController {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  init() {
    this.router.get('/', this.getHealth);
  }

  private async getHealth(req: Request, res: Response) {
    logger.info(`GET /health called`);
    
    return res.sendStatus(StatusCodes.OK);
  }
}

export default new HealthController().router;
