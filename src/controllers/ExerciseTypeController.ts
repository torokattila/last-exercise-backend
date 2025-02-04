import { Logger, PromiseRejectionHandler } from '../common';
import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ExerciseTypeService from '../services/ExerciseTypeService';
import { validate as uuidValidate } from 'uuid';

const logger = Logger(__filename);

class ExerciseTypeController {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  init() {
    this.router.delete(
      '/:id',
      PromiseRejectionHandler(this.deleteExerciseType)
    );
  }

  private async deleteExerciseType(req: Request, res: Response) {
    logger.info(
      `DELETE /exercisetypes/:id called, id param: ${JSON.stringify(
        req.params.id
      )}`
    );

    const id = req.params.id;

    if (!id || !uuidValidate(id)) throw new Error('invalid_path_parameters');

    try {
      await ExerciseTypeService.remove(id);

      logger.info(`DELETE /exercisetypes/${id} status code: ${StatusCodes.NO_CONTENT}`);
      return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: [error],
      });
    }
  }
}

export default new ExerciseTypeController().router;
