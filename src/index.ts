import http from 'http';
import { createConnection } from 'typeorm';
import App from './app';
import Logger from 'common/Logger';
import config from './config';

const logger = Logger(__filename);

createConnection().then(() => {
  const server = http.createServer(App);

  server.listen(config.listenPort, config.listenHost, () => {
    logger.info(
      `Running at ${config.protocol}://${config.listenHost}:${config.listenPort} in ${config.env} mode`
    );

    if (config.env === 'production') {
      logger.info(
        `Serving bundled content from path: ${process.env.NODE_PATH}`
      );
    }

    logger.info('Press CTRL-C to stop\n');
  });
});
