// import { Request } from "express"

declare namespace Express {
  export interface Request {
    sessionLogin?: string;
    curUser?: any;
  }
}
