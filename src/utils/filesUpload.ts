import { getTodayString } from '@/utils/datatime';
import {
  getExtensionFile,
  getUploadDoumnentsPath,
  getUploadDoumnentsUrl,
} from '@/utils/fileHelper';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs';

/** Execute upload documents file: pdf, docx, ... */
export const excuteUploadFiles = (
  uploadedFile: UploadedFile,
  createBy: string,
  assetType: string,
  stringFormatUploadedDate: string,
  folderOwner: string,
  additionPrefixFilePath: string
) => {
  let fileName = '';
  let defaultAssetType = 'candidates';
  let defaultFolderOwner = 'unknown';
  try {
    const fileExtension = getExtensionFile(uploadedFile.name);
    let defaultUploadDate = getTodayString('YYYYMMDDHHmmss');
    /** build file path to upload and db store */
    if (stringFormatUploadedDate !== '') {
      defaultUploadDate = stringFormatUploadedDate;
      fileName += defaultUploadDate;
    }
    additionPrefixFilePath !== ''
      ? (fileName += `_${additionPrefixFilePath}`)
      : (fileName += '');
    createBy !== '' ? (fileName += `_${createBy}`) : (fileName += '_admin');
    uploadedFile.name !== ''
      ? (fileName += `_${uploadedFile.name}`)
      : (fileName += `_unknown${fileExtension}`);
    defaultAssetType = assetType !== '' ? assetType : defaultAssetType;
    defaultFolderOwner = folderOwner !== '' ? folderOwner : defaultFolderOwner;
    const filePath = `${defaultAssetType}/${defaultFolderOwner.toLowerCase()}`;
    const targetUploadDirectory = getUploadDoumnentsPath(filePath);
    /** Validate if candidate storage is existed yet */
    /** Create formatted folder if not existed */
    if (!fs.existsSync(targetUploadDirectory)) {
      fs.mkdirSync(`${targetUploadDirectory}`, { recursive: true });
    }
    const fileUpload = `${targetUploadDirectory}/${fileName}`;
    uploadedFile.mv(fileUpload);
    /** build docs url for storing in database */
    const fileUrl = `${getUploadDoumnentsUrl(filePath)}/${fileName}`;
    return {
      status: true,
      message: 'Upload success',
      fileUrl: fileUrl,
    };
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const showUploadFiles = (
  assetType: string,
  fileName: string,
  owner: object
) => {};
