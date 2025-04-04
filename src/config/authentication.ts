import { accessTokenKey } from '@/constants/token';
import { getUserAccessToken } from '@/services/authService';
import { HttpResError } from '@/types/error';
import { checkLoginSessionFile } from '@/utils/fileHelper';
import { verifyAccessToken } from '@/utils/jwtToken';
import { NextFunction, Request, Response } from 'express';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = '';
    // verify when has access_token
    const cookieToken = req.cookies[accessTokenKey];
    if (cookieToken) {
      token = cookieToken;
    }

    //  verify when hasn't access_token but has bearer token
    const bearerHeader = req.headers['authorization'] || '';
    if (bearerHeader && token == '') {
      const bearerToken = bearerHeader.split(' ')[1] ?? '';
      token = bearerToken;
    }

    // case token isn't exist
    if (!token || token == '') {
      throw new Error('non token');
    }

    // verify token jwt and get token data
    const tokenData = await verifyAccessToken(token);
    if (!tokenData) {
      throw new Error('token incorrect');
    }

    // check exist session file
    if (!(await checkLoginSessionFile(tokenData.se))) {
      throw new Error('session fail');
    }

    // get author user by token data
    const author = await getUserAccessToken(tokenData);
    // if (!author) {
    //   throw new Error('non user');
    // }

    req.curUser = author;
    req.sessionLogin = tokenData.se;
  } catch (e: any) {
    // console.log('Auth Middleware: ' + e.message);
  }

  next();
};

// Middleware to check has logged user
export const mustLoggedAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // check logged
  if (req.curUser) {
    return next();
  }

  next(new HttpResError('Unauthorized', 401));
};

/**
 *  Middleware to check role
 * @param role format ('Role:Team' | 'Role')[]
 * @returns
 */
export const authorize = (whoiam: string = 'cfoadmin') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // check logged
      if (req.curUser?.name === whoiam) {
        return next();
      }
    } catch (e: any) {}

    next(new HttpResError('permission denied', 403));
  };
};
