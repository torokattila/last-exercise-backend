import cors from 'cors';
import express, { Application } from 'express';
import morgan from 'morgan';
import config from './config';
import ExerciseController from './controllers/ExerciseController';
import ExerciseTypeController from './controllers/ExerciseTypeController';
import HealthController from './controllers/HealthController';
import LoginController from './controllers/LoginController';
import MeController from './controllers/MeController';
import RegistrationController from './controllers/RegistrationController';
import UserController from './controllers/UserController';
import { authenticate } from './middlewares/Authenticate';

class App {
  public express: Application;

  constructor() {
    this.init();
  }

  private init() {
    this.express = express();
    this.middlewares();
    this.routes();
  }

  private routes() {
    this.express.use('/health', HealthController);
    this.express.use('/register', RegistrationController);
    this.express.use('/login', LoginController);
    this.express.use('/me', authenticate, MeController);
    this.express.use('/users', authenticate, UserController);
    this.express.use('/exercises', authenticate, ExerciseController);
    this.express.use('/exercisetypes', authenticate, ExerciseTypeController);
  }

  private middlewares() {
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(morgan(config.accessLogFormat));
    this.express.use(
      cors({
        origin: config.enabledOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        optionsSuccessStatus: 200,
        exposedHeaders: [
          'X-Total-Count',
          'X-Pagination-Page',
          'X-Pagination-Limit',
        ],
      })
    );
  }
}

export default new App().express;
