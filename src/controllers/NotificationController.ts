import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger, PromiseRejectionHandler } from '../common';
import NotificationService from '../services/NotificationService';
import UserService from '../services/UserService';

const logger = Logger(__filename);

class NotificationController {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  init() {
    this.router.post('/push-subscription', PromiseRejectionHandler(this.savePushSubscription));
    this.router.post('/schedule', PromiseRejectionHandler(this.scheduleNotification));
    this.router.delete('/schedule', PromiseRejectionHandler(this.cancelNotification));
  }

  private async savePushSubscription(req: Request, res: Response) {
    logger.info('POST /notifications/push-subscription called');

    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ errors: ['token_required'] });
    }

    await UserService.saveFcmToken(userId, token);

    logger.info(`POST /notifications/push-subscription status code: ${StatusCodes.OK}`);
    return res.status(StatusCodes.OK).send({ message: 'push_subscription_saved' });
  }

  private async scheduleNotification(req: Request, res: Response) {
    logger.info('POST /notifications/schedule called');

    const userId = req.user.id;
    const { intervalSeconds, exerciseName } = req.body;

    if (!intervalSeconds || !exerciseName) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errors: ['interval_seconds_required', 'exercise_name_required'],
      });
    }

    const user = await UserService.findById(userId);

    if (!user.fcmToken) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ errors: ['fcm_token_not_found'] });
    }

    NotificationService.scheduleNotification(
      userId,
      user.fcmToken,
      exerciseName,
      Number(intervalSeconds),
    );

    logger.info(`POST /notifications/schedule status code: ${StatusCodes.OK}`);
    return res.status(StatusCodes.OK).send({ message: 'notification_scheduled' });
  }

  private async cancelNotification(req: Request, res: Response) {
    logger.info('DELETE /notifications/schedule called');

    const userId = req.user.id;

    NotificationService.cancelScheduledNotification(userId);

    logger.info(`DELETE /notifications/schedule status code: ${StatusCodes.OK}`);
    return res.status(StatusCodes.OK).send({ message: 'notification_cancelled' });
  }
}

export default new NotificationController().router;
