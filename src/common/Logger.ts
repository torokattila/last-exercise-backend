import config from '../config';
import path from 'path';
import winston, { Logger } from 'winston';
import dailyRotate from 'winston-daily-rotate-file';

const logger = winston.createLogger({
    level: config.logLevel,
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf((msg) =>
            winston.format
                .colorize()
                .colorize(
                    msg.level,
                    `${msg.timestamp} ${msg.level} ${msg.message}`
                )
        )
    ),
    transports: [new winston.transports.Console()],
});

const toFile = config.logToFile;
const projectName = config.projectName;

if (toFile) {
    logger.add(
        new dailyRotate({
            filename: path.join(
                `${__dirname}/../../log`,
                `${projectName}-error.log`
            ),
            datePattern: 'YYYYMMDD',
            handleExceptions: false,
            json: false,
            level: 'error',
            format: winston.format.combine(
                winston.format.splat(),
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.printf(
                    (msg) => `${msg.timestamp} ${msg.level} ${msg.message}`
                )
            ),
        })
    );
    logger.add(
        new dailyRotate({
            filename: path.join(`${__dirname}/../../log`, `${projectName}.log`),
            datePattern: 'YYYYMMDD',
            handleExceptions: false,
            json: false,
            level: config.logLevel,
            format: winston.format.combine(
                winston.format.splat(),
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.printf(
                    (msg) => `${msg.timestamp} ${msg.level} ${msg.message}`
                )
            ),
        })
    );
}

type loggerFunction = (message: string, ...meta: any[]) => Logger;

export type loggerObject = { [key: string]: loggerFunction };

export default function (filename: string): loggerObject {
    const name =
        filename.lastIndexOf('/') !== -1
            ? filename.substring(filename.lastIndexOf('/') + 1)
            : filename.substring(filename.lastIndexOf('\\') + 1);

    const myLogger = {
        error: function (message: string, ...meta: any[]): Logger {
            return logger.error(`${name} - ${message}`, ...meta);
        },
        info: function (message: string, ...meta: any[]): Logger {
            return logger.info(`${name} - ${message}`, ...meta);
        },
        debug: function (message: string, ...meta: any[]): Logger {
            return logger.debug(`${name} - ${message}`, ...meta);
        },
        warn: function (message: string, ...meta: any[]): Logger {
            return logger.warn(`${name} - ${message}`, ...meta);
        },
    };

    return myLogger;
}
