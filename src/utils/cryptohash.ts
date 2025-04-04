import CryptoJS from 'crypto-js';
const secretGiftocde = process.env.SECRET_GIFTCODE ?? '1234567890abcdef';
const secretHashEmail = process.env.SECRET_HASH_EMAIL ?? '1234567890abcdef';

/**
 * use CryptoJS AES for encrypt voucher data
 * @param message string
 * @param sessionKey string
 * @returns string
 */
export const hashVoucherData = (message: string, sessionKey: string) => {
  // handle key
  const iv = CryptoJS.enc.Utf8.parse(sessionKey);
  const key = CryptoJS.enc.Utf8.parse(secretGiftocde);
  // encrypt voucher data
  const cipherBytes = CryptoJS.AES.encrypt(message, key, { iv: iv });
  const ciphertext = cipherBytes.toString();

  return ciphertext;
};

/**
 * use CryptoJS AES for decode voucher data
 * @param token string
 * @param sessionKey string
 * @returns json string
 */
export const decryptVoucherData = (token: string, sessionKey: string) => {
  // handle key
  let iv = CryptoJS.enc.Utf8.parse(sessionKey);
  let key = CryptoJS.enc.Utf8.parse(secretGiftocde);
  //Decode from text
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(token),
  });
  let cipherBytes = CryptoJS.AES.decrypt(cipherParams, key, { iv: iv });

  const data = cipherBytes.toString(CryptoJS.enc.Utf8);

  return data;
};

/**
 * hash password for signup
 * @param password
 * @returns
 */
export const hashPassword = (password: string) => {
  const hash = CryptoJS.HmacSHA256(password, process.env.SECRET_PASSWORD ?? '');
  return CryptoJS.enc.Base64.stringify(hash);
};

/**
 * compare password login
 * @param input
 * @param hashPassword
 * @returns
 */
export const comparePassword = (input: string, hashPassword: string) => {
  try {
    const hash = CryptoJS.HmacSHA256(input, process.env.SECRET_PASSWORD ?? '');
    const hashInput = CryptoJS.enc.Base64.stringify(hash);

    if (hashInput === hashPassword) {
      return true;
    }
  } catch (e) {
    console.log(e);
  }

  return false;
};

/**
 * use CryptoJS AES for encrypt email of user
 * @param message string
 * @param sessionKey string
 * @returns string
 */
export const hashTokenCode = (message: string, sessionKey: string) => {
  // handle key
  const iv = CryptoJS.enc.Utf8.parse(sessionKey);
  const key = CryptoJS.enc.Utf8.parse(secretHashEmail);
  // encrypt voucher data
  const cipherBytes = CryptoJS.AES.encrypt(message, key, { iv: iv });
  const ciphertext = cipherBytes.toString();

  return ciphertext;
};

/**
 * use CryptoJS AES for decode email of user
 * @param token string
 * @param sessionKey string
 * @returns json string
 */
export const decryptTokenCode = (token: string, sessionKey: string) => {
  // handle key
  let iv = CryptoJS.enc.Utf8.parse(sessionKey);
  let key = CryptoJS.enc.Utf8.parse(secretHashEmail);
  //Decode from text
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(token),
  });
  let cipherBytes = CryptoJS.AES.decrypt(cipherParams, key, { iv: iv });

  const data = cipherBytes.toString(CryptoJS.enc.Utf8);

  return data;
};
