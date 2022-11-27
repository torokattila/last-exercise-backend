const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        type: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        database: process.env.POSTGRES_DB,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        entities: ['src/entities/*.ts'],
        migrations: ['db/migrations/*.ts'],
        cli: {
            migrationsDir: 'db/migrations',
        },
        logging: false,
        synchronize: true,
    },
    production: {
        type: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        database: process.env.POSTGRES_DB,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        entities: ['dist/entities/*.js'],
        migrations: ['db/migrations/*.js'],
        cli: {
            migrationsDir: 'db/migrations',
        },
        logging: false,
        synchronize: true,
    },
};

module.exports = [config[env] || config['development']];
