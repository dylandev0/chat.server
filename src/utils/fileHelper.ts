const sysPath = require('path');
import {
  accessSync,
  appendFile,
  constants,
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'fs';

/**
 * convert file path to path of giftsession file path
 * @param path
 * @returns
 */
export const getGiftSessionPath = (path: string) => {
  return sysPath.resolve('storage/giftsession', path);
};

export const getCpdcheckImagePath = (path: string) => {
  return sysPath.resolve('storage/images/cpdcheck', path);
};

export const getCpdcheckImageUrl = (path: string) => {
  return sysPath.join('/up/images/cpdcheck', path);
};

export const getAvatarImageUrl = (path: string) => {
  return sysPath.join('storage/images/avatar', path);
};

export const getUploadImagesPath = (path: string) => {
  return sysPath.resolve('storage/images', path);
};

export const getUploadDoumnentsPath = (path: string) => {
  return sysPath.resolve('storage/documents', path);
};

export const getUploadDoumnentsUrl = (path: string) => {
  return sysPath.join('up/documents', path);
};

/**
 * convert file path to path of giftsession file path
 * @param path
 * @returns
 */
export const getPathImageUploadShow = (name: string, prefix: string = '') => {
  return sysPath.join('/up/images', prefix, name);
};

/**
 * convert file path to path of giftsession file path
 * @param path
 * @returns
 */
export const getLoggerFilePath = (name: string) => {
  const loggerFileName = `${name}.log`;

  return sysPath.resolve('storage/logs', loggerFileName);
};

/**
 * check exist and create default directory
 */
export const checkAndCreateDefaultDir = () => {
  const createDirs = [
    'storage/giftsession',
    'storage/logs',
    'storage/loginsession',
    'storage/images/cpdcheck',
    'storage/images/avatar',
  ];

  for (let path of createDirs) {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  }
};

/**
 * create the file if it doesn't exist.
 * @param filePath
 */
export const createIfNotExists = async (filePaths: string) => {
  try {
    await accessSync(filePaths, constants.R_OK | constants.W_OK);
  } catch (err) {
    await writeFileSync(filePaths, '');
  }
};

/**
 * create session login file
 * @param session
 */
export const createLoginSessionFile = async (session: string) => {
  try {
    let filePaths = sysPath.resolve('storage/loginsession', session);
    await writeFileSync(filePaths, '');
  } catch (err: any) {
    console.log(err.message);
  }
};

/**
 * remove session login file
 * @param session
 */
export const removeLoginSessionFile = async (session: string) => {
  try {
    let filePaths = sysPath.resolve('storage/loginsession', session);
    await unlinkSync(filePaths);
  } catch (err: any) {
    console.log(err.message);
  }
};

/**
 * check session login file
 * @param session
 */
export const checkLoginSessionFile = async (session: string) => {
  try {
    let filePaths = sysPath.resolve('storage/loginsession', session);
    await accessSync(filePaths, constants.R_OK | constants.W_OK);

    return true;
  } catch (err: any) {
    console.log(err);

    return false;
  }
};

/**
 * handle writing to the file.
 * @param filePaths
 * @param content
 */
export const appendToFile = async (filePaths: string, content: string) => {
  await createIfNotExists(filePaths);
  appendFile(filePaths, content, err => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
    // Optionally, you can log success or handle any cleanup here
  });
};

/**
 * check exist and create giftsession directory
 */
export const createDir = (path: string) => {
  // const dirFullPath = sysPath.resolve('storage/images/cpdcheck')

  if (!existsSync(path)) {
    mkdirSync(path);
  }
};

export const getExtensionFile = (name: string) => {
  return sysPath.extname(name);
};

/***
 * get json options
 */
export const getJsonOptions = async (
  name: string
): Promise<[{ [key: string]: any; id: string; name: string }] | null> => {
  const optionsFile = sysPath.resolve(
    'src/options',
    `${name.toLowerCase()}.json`
  );

  try {
    const data = await readFileSync(optionsFile, 'utf8');
    const jsonOptions = JSON.parse(data);
    return jsonOptions;
  } catch (error: any) {
    console.error(`Error reading JSON file: ${error.message}`);
    return null;
  }
};
