// import dotenv from 'dotenv';
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = {
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  host: process.env.MYSQL_DOMAIN,
  port: process.env.MYSQL_PORT,
  dialect: 'mysql',
};

module.exports = {
  development: dbConfig,
  production: dbConfig,
};
