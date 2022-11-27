import { Logger, PromiseRejectionHandler } from '../common';
import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ExerciseService from '../services/ExerciseService';
import * as Yup from 'yup';
// import { validate as uuidValidate } from 'uuid';

const logger = Logger(__filename);

const ExerciseSchema = Yup.object().shape({
  name: Yup.string().required('name_required'),
  userId: Yup.string().required('user_id_required'),
});

class ExerciseController {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  init() {
    this.router.post('/', PromiseRejectionHandler(this.createExercise));
    this.router.get('/:id', PromiseRejectionHandler(this.getExercise));
    this.router.get('/', PromiseRejectionHandler(this.listExercises));
    this.router.put('/:id', PromiseRejectionHandler(this.editExercise));
    this.router.delete('/:id', PromiseRejectionHandler(this.deleteExercise));
  }

  private async createExercise(req: Request, res: Response) {
    logger.info(`POST /exercises called, body: ${req.body}`);

    const exercise = req.body;

    try {
      await ExerciseSchema.validate(exercise, { abortEarly: false });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: error.errors,
      });
    }

    const result = await ExerciseService.create(exercise);

    logger.info(`POST /exercises status code: ${StatusCodes.CREATED}`);
    return res.status(StatusCodes.CREATED).send(result);
  }

  private async getExercise(req: Request, res: Response) {
    logger.info(
      `GET /exercises/:id called, id param: ${JSON.stringify(req.params.id)}`
    );

    const id = req.params.id;

    if (!id) throw new Error('invalid_path_parameters');

    try {
      const exercise = await ExerciseService.findById(id);

      if (exercise) {
        logger.info(`GET /exercises/${id} status code: ${StatusCodes.OK}`);
        return res.status(StatusCodes.OK).send(exercise);
      } else {
        return res.status(StatusCodes.BAD_REQUEST).send({
          errors: ['exercise_not_found'],
        });
      }
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: [error],
      });
    }
  }

  private async listExercises(req: Request, res: Response) {
    logger.info('GET /exercises called');

    const userId = req.user.id;

    try {
      const exerciseList = await ExerciseService.list(userId);

      logger.info(`GET /exercises status code: ${StatusCodes.OK}`);
      return res.status(StatusCodes.OK).send(exerciseList);
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: [error],
      });
    }
  }

  private async editExercise(req: Request, res: Response) {
    logger.info(
      `PUT /exercises/:id called, id param: ${JSON.stringify(
        req.params.id
      )}, body: ${JSON.stringify(req.body)}`
    );

    const id = req.params.id;

    if (!id) throw new Error('invalid_path_parameters');

    const editableExercise = req.body;

    try {
      await ExerciseSchema.validate(editableExercise, { abortEarly: false });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: error.errors,
      });
    }

    const editedExercise = await ExerciseService.update(editableExercise);

    logger.info(`PUT /exercises/${id} status code: ${StatusCodes.OK}`);
    return res.status(StatusCodes.OK).send(editedExercise);
  }

  private async deleteExercise(req: Request, res: Response) {
    logger.info(
      `DELETE /exercises/:id called, id param: ${JSON.stringify(req.params.id)}`
    );

    const id = req.params.id;

    if (!id) throw new Error('invalid_path_parameters');

    try {
      await ExerciseService.remove(id);

      logger.info(`DELETE /exercises/${id} status code: ${StatusCodes.NO_CONTENT}`);
      return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: [error],
      });
    }
  }
}

export default new ExerciseController().router;
