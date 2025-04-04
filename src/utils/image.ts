const sharp = require('sharp');
const fs = require('fs');

export const convertAvatar = async (data: any, path: string) => {
  try {
    const iamge = sharp(data);

    const metadata = await iamge.metadata();

    const size =
      metadata.width > metadata.height ? metadata.height : metadata.width;
    await iamge
      .resize({
        width: size,
        height: size,
      })
      .toFile(path);

    return true;
  } catch (error) {
    console.log(`An error occurred during processing: ${error}`);
    return false;
  }
};
