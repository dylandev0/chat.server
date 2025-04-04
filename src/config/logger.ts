import { actionLogger } from '@/services/loggerService';
import { NextFunction, Request, Response } from 'express';

// handle logger
export const loggerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let logMsg = '';
    // logged user
    if (req.curUser && req.curUser.email) {
      logMsg += `[${req.curUser.email}]  `;
    } else {
      logMsg += `[No User]  `;
    }
    // client address
    logMsg += `[${req.ip}|${req.headers.origin}]  `;
    // action request
    logMsg += `[${req.method}] ${req.path}`;

    // action for email
    if (req.body.email) {
      logMsg += ` [for:${req.body.email}]  `;
    }

    //write log
    actionLogger(logMsg);
  } catch (e: any) {}

  next();
};
