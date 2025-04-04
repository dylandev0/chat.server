import { body } from 'express-validator';

export const updatePasswordSchema = [
  body('old_password').notEmpty(),
  body('password').notEmpty(),
];

export const createAuthorSchema = [body('name').notEmpty()];

export const updateAuthorSchema = [body('name')];

export const loginSchema = [
  body('password').notEmpty(),
  body('email').isEmail().notEmpty(),
];
