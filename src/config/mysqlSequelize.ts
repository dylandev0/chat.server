// sequelize.ts
import { Sequelize } from 'sequelize';

const mysqlEnv = {
  username: process.env.MYSQL_USERNAME || '',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || '',
  domain: process.env.MYSQL_DOMAIN || '',
  port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : undefined,
};

// Create a new Sequelize instance with your database configuration
export const mysqlSequelize = new Sequelize(
  mysqlEnv.database,
  mysqlEnv.username,
  mysqlEnv.password,
  {
    host: mysqlEnv.domain,
    port: mysqlEnv.port,
    dialect: 'mysql',
    logging: false, // Set to true to enable SQL query logging
    dialectOptions: {
      connectTimeout: 60000, // 60 seconds
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    timezone: '+07:00',
  }
);

export const mysqlConnnect = () => {
  mysqlSequelize
    .authenticate()
    .then(() => {
      console.log('Msyql Connection has been established successfully.');
    })
    .catch(error => {
      console.error('Unable to connect to the database: ', error);
    });
};
