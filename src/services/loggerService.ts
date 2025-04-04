import { appendToFile, getLoggerFilePath } from '@/utils/fileHelper';

/**
 * write request action log
 * @param logStr
 * @param fileName
 * @returns
 */
export const actionLogger = async (message: string) => {
  try {
    // date log
    const date = new Date().toISOString().substring(0, 19).replace('T', ' ');
    const logString = `${date}:  ${message}\n`;
    // log file name
    const logFileName = date.substring(0, 10).replaceAll('-', '');

    const logFilePath = getLoggerFilePath(logFileName);
    appendToFile(logFilePath, logString);
  } catch (err) {
    console.log(err);
    return false;
  }
};

/**
 * get request error log
 * @param data
 * @returns
 */
export const errorLogger = async (errMsg: string) => {
  try {
    // date log
    const date = new Date().toISOString().substring(0, 19).replace('T', ' ');
    const logString = `${date}: ERROR ${errMsg}\n`;
    // log file name
    const logFileName = date.substring(0, 10).replaceAll('-', '');

    const logFilePath = getLoggerFilePath(logFileName);
    appendToFile(logFilePath, logString);
  } catch (err) {
    console.log(err);
    return false;
  }
};
