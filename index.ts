import dotenv from 'dotenv';
dotenv.config();
import { authMiddleware } from '@/config/authentication';
import { loggerMiddleware } from '@/config/logger';
import { mysqlConnnect } from '@/config/mysqlSequelize';
import { relationsync } from '@/models/relation';
import router from '@/routers';
import { errorLogger } from '@/services/loggerService';
import { HttpResError } from '@/types/error';
import {
  checkAndCreateDefaultDir,
  getUploadImagesPath,
  getUploadDoumnentsPath
} from '@/utils/fileHelper';
import express, { NextFunction, Request, Response } from 'express';
import http from "http";
import fileUpload from 'express-fileupload';
import { runCronjob } from '@/cronjob';
import { createSockerIO } from '@/config/socketService';

// var multer = require('multer');
// var upload = multer();

const expressListRoutes = require('express-list-routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express() as any;
const server = http.createServer(app);

const PORT = process.env.SERVER_PORT || 3000;
const HOST = process.env.SERVER_HOST || '0.0.0.0';

// create default directory
checkAndCreateDefaultDir();

// connect DB
// connectMongoDB()
// mysqlConnnect();
// relationsync();

// config CORS
const corsOptions = {
  origin: process.env.FE_URL ? process.env.FE_URL.split(',') : '*',
  credentials: true,
  exposedHeaders: ['X-Total-Count'],
};

app.use(cors(corsOptions));
app.set('trust proxy', true);
// config file updaload
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
// config body
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(upload.array()); 

app.use('/up/images', express.static(getUploadImagesPath('')));
app.use('/up/documents', express.static(getUploadDoumnentsPath('')));

// handel logged user
app.use(authMiddleware);
// handel logger
app.use(loggerMiddleware);
// socket
createSockerIO(server)
// api action
// app.use("/api", publicRouter)
app.use('/api', router);

// middleware handling after controller
app.use((req: Request, res: Response, next: NextFunction) => {
  errorLogger("the action isn't exist");
  res.status(200).send({ errStatus: 404, msgCode: "100", message: 'Something broke!' });
});
// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const sendJson: any = { errStatus: 404, message: 'Something broke!', msgCode: 100 };
  if (err instanceof HttpResError) {
    sendJson.errStatus = err.status;
    sendJson.message = err.message;
    sendJson.msgCode = err.msgCode;
    sendJson.params = err.params;

    if( err.status == 401 ){
      return res.status(401).send(sendJson);
    }
  } else {
    errorLogger(err.message);
  }

  res.status(200).send(sendJson);
});

server.listen(PORT, () => {
  console.log(`[server]: Server is running at http://${HOST}:${PORT}`);
});


runCronjob()