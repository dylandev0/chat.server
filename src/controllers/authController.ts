import { accessTokenKey } from '@/constants/token';
import {
  getAuthor,
  getAuthorById,
  updateAuthorById,
} from '@/stores/authorStore';
import { HttpResError } from '@/types/error';
import {
  comparePassword,
  hashPassword,
  hashTokenCode,
} from '@/utils/cryptohash';
import { createLoginSessionFile } from '@/utils/fileHelper';
import { generateSessionLogin, randomPassword } from '@/utils/generate';
import { generateAccessToken } from '@/utils/jwtToken';
import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
const defaultPass = process.env.VIEW_PASSWORD;
const cfoPass = process.env.CFO_PASSWORD;

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let userName = 'thanhvien';
    if (cfoPass === req.body.password) {
      userName = 'cfoadmin';
    } else if (defaultPass !== req.body.password) {
      throw new HttpResError('Bạn không phải thành viên của chúng tôi', 400);
    }

    let expires = '24h';
    let maxAge = 24 * 3600 * 1000;

    const session = generateSessionLogin();
    createLoginSessionFile(session);
    const accountCode = hashTokenCode(userName, session);
    const jwttoken = generateAccessToken(
      'member',
      accountCode,
      session,
      expires
    );

    res.cookie(accessTokenKey, jwttoken, {
      maxAge: maxAge,
      // httpOnly: true,
      secure: false,
      //  path: '/',
      sameSite: 'none',
    });

    const sessionData = {
      user: {
        name: 'member',
      },
      expires,
      maxAge,
      access_token: jwttoken,
    };

    res.send(sessionData);
  } catch (e) {
    return next(e);
  }
};

export const generate_new_password = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let author = await getAuthor({ query: { account: req.body.account } });
    if (!author) {
      throw new HttpResError('Unauthorized', 401);
    }

    const userName = (author.user as any).name ?? '';

    const password = randomPassword();
    const passHashed = hashPassword(password);

    const authorRegisterData = {
      password: passHashed,
      passwordUpdateAt: Date.now(),
    };
    author = await updateAuthorById(author.id, authorRegisterData);

    res.send({
      name: userName,
      password: password,
    });
  } catch (e) {
    return next(e);
  }
};

export const update_password = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.curUser) {
      throw new HttpResError('Unauthorized', 401);
    }

    if (!req.body.password || req.body.password.length < 8) {
      throw new HttpResError('Input password, please', 404);
    }

    if (req.body.password == req.body.old_password) {
      throw new HttpResError('New password must not match Old password', 404);
    }

    const author = await getAuthorById(req.curUser.id);
    if (!author) {
      throw new HttpResError('Unauthorized', 401);
    }

    if (!comparePassword(req.body.old_password, author.password ?? '')) {
      throw new HttpResError('Password cũ không đúng', 400);
    }

    const passHashed = hashPassword(req.body.password);

    const authorRegisterData = {
      password: passHashed,
      passwordUpdateAt: Date.now(),
    };
    await updateAuthorById(author.id, authorRegisterData);

    res.send({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};
