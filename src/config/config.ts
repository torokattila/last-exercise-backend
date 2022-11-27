import dotenv from 'dotenv';
import path from 'path';

const rootPath = path.join(__dirname, '..', '..');

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const config: any = {
  default: {
    env: 'dev',
    protocol: 'http',
    hostname: 'localhost',
    logLevel: 'debug',
    listenPort: 6060,
    listenHost: '0.0.0.0',
    logDir: path.join(rootPath, 'log'),
    accessLogFormat: 'tiny',
    projectName: 'last-exercise-api',
    port: process.env.PORT,
    jwtTokenSecret: process.env.JWT_TOKEN_SECRET,
    tokenSecret: process.env.TOKEN_SECRET,
    defaultPageSize: Number.MAX_SAFE_INTEGER,
  },
  development: {
    env: 'dev',
    protocol: 'http',
    logToFile: false,
    hostname: 'localhost',
    enabledOrigins: ['http://localhost:3000'],
    clientUrl: 'http://localhost:3000',
  },
  production: {
    env: 'prod',
    protocol: 'https',
    hostname: 'localhost',
    listenPort: 6060,
    enabledOrigins: [
      'http://localhost:3000',
      'https://last-exercise.vercel.app',
    ],
    clientUrl: 'https://last-exercise.vercel.app',
  },
};

export default { ...config.default, ...config[env] } as typeof config.default;
