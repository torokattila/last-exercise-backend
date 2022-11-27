import { Logger, PromiseRejectionHandler } from '../common';
import { Router, Request, Response } from 'express';
import * as Yup from 'yup';
// import { validate as uuidValidate } from 'uuid';
import UserService from '../services/UserService';
import { StatusCodes } from 'http-status-codes';

const logger = Logger(__filename);

const UpdateUserSchema = Yup.object().shape({
  email: Yup.string().required('email_required'),
  firstname: Yup.string().required('firstname_required'),
  lastname: Yup.string().required('lastname_required'),
});

const UpdateLastExerciseSchema = Yup.object().shape({
  exerciseId: Yup.string().required('exercise_id_required'),
});

class UserController {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  init() {
    this.router.get('/:id', PromiseRejectionHandler(this.getUser));
    this.router.put('/:id', PromiseRejectionHandler(this.updateUser));
    this.router.put(
      '/:id/password/update',
      PromiseRejectionHandler(this.updatePassword)
    );
    this.router.put(
      '/:id/lastexercise',
      PromiseRejectionHandler(this.updateLastExercise)
    );
    this.router.delete('/:id', PromiseRejectionHandler(this.deleteUser));
  }

  private async getUser(req: Request, res: Response) {
    logger.info(
      `GET /users/:id called, id param: ${JSON.stringify(req.params.id)}`
    );

    const id = req.params.id;

    if (!id) throw new Error('invalid_path_parameters');

    try {
      const user = await UserService.findById(id);

      if (user) {
        logger.info(`GET /users/${id} status code: ${StatusCodes.OK}`);

        return res.status(StatusCodes.OK).send(user);
      } else {
        return res.status(StatusCodes.BAD_REQUEST).send({
          errors: ['user_not_found'],
        });
      }
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: [error],
      });
    }
  }

  private async updateUser(req: Request, res: Response) {
    logger.info(
      `PUT /users/:id called, id param: ${JSON.stringify(
        req.params.id
      )}, body: ${JSON.stringify(req.body)}`
    );

    const id = req.params.id;

    if (!id) throw new Error('invalid_path_parameters');

    const editableUser = req.body;

    try {
      await UpdateUserSchema.validate(editableUser, {
        abortEarly: false,
      });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: error.errors,
      });
    }

    const updatedUser = await UserService.update(id, editableUser);

    logger.info(`PUT /users/:id status code: ${StatusCodes.OK}`);
    return res.status(StatusCodes.OK).send(updatedUser);
  }

  private async updatePassword(req: Request, res: Response) {
    logger.info(
      `PUT /users/:id/password/update called, id param: ${JSON.stringify(
        req.params.id
      )}`
    );

    const id = req.params.id;

    if (!id) throw new Error('invalid_path_parameters');

    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (currentPassword) {
      const userByEmail = await UserService.findByEmail(req.user.email);
      const isValidPassword = await UserService.comparePassword(
        currentPassword,
        userByEmail.password
      );

      if (!isValidPassword) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          errors: ['invalid_current_password'],
        });
      }
    }

    if (!newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: ['password_is_required'],
      });
    }

    if (!newPasswordConfirm) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: ['password_confirm_is_required'],
      });
    }

    if (!UserService.validatePasswordMatch(newPassword, newPasswordConfirm)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: ['passwords_must_match'],
      });
    }

    const result = await UserService.updatePassword(id, newPassword);

    logger.info(
      `PUT /users/${id}/password/update status code: ${StatusCodes.OK}`
    );
    return res.status(StatusCodes.OK).send(result);
  }

  private async deleteUser(req: Request, res: Response) {
    logger.info(
      `DELETE /users/:id called, id param: ${JSON.stringify(req.params.id)}`
    );

    const id = req.params.id;

    if (!id) throw new Error('invalid_path_parameters');

    await UserService.remove(id);

    logger.info(`DELETE /users/${id} status code: ${StatusCodes.NO_CONTENT}`);
    return res.sendStatus(StatusCodes.NO_CONTENT);
  }

  private async updateLastExercise(req: Request, res: Response) {
    logger.info(
      `PUT /users/:id/lastexercise called, id param: ${JSON.stringify(
        req.params.id
      )}, body: ${JSON.stringify(req.body)}`
    );

    const id = req.params.id;
    const exerciseId = req.body.exerciseId;
    const duration = req.body.duration;

    if (!id) throw new Error('invalid_path_parameters');

    try {
      await UpdateLastExerciseSchema.validate(req.body, { abortEarly: false });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: error.errors,
      });
    }

    const updatedUser = await UserService.updateLastExercise(
      id,
      exerciseId,
      duration,
    );

    logger.info(`PUT /users/${id}/lastexercise status code ${StatusCodes.OK}`);
    return res.status(StatusCodes.OK).send(updatedUser);
  }
}

export default new UserController().router;
