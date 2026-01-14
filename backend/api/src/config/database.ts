import { Sequelize } from 'sequelize';
import { config } from './config';
import { logger } from '../utils/logger';

export const sequelize = new Sequelize({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  username: config.database.username,
  password: config.database.password,
  dialect: config.database.dialect,
  logging: config.database.logging ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: config.database.ssl ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  } : {},
});

// Test connection
sequelize.authenticate()
  .then(() => {
    logger.info('Database connection has been established successfully.');
  })
  .catch((error) => {
    logger.error('Unable to connect to the database:', error);
  });

export default sequelize;
