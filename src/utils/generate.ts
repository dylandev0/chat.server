const bcrypt = require('bcrypt');
const generator = require('generate-password');

/**
 * generate password
 * @param length
 * @returns
 */
export const randomPassword = (length: number = 16) => {
  return generator.generate({
    length: length,
    numbers: true,
    symbols: true,
  });
};

/**
 * random token for register user
 * @param length
 * @returns
 */
export const randomTokenRegister = (length: number = 20) => {
  return generator.generate({
    length: length,
    numbers: true,
    symbols: true,
  });
};

/**
 * random file name and session key for voucher data
 * @returns string
 */
export const generateSession = () => {
  return generator.generate({
    length: 22,
    numbers: true,
    symbols: false,
  });
};

/**
 * random file name and session key for voucher data
 * @returns string
 */
export const generateSessionLogin = () => {
  let timeStr = new Date().getTime().toString();
  let lengthRan = 32 - timeStr.length;
  let ranStr = generator.generate({
    length: lengthRan,
    numbers: true,
    symbols: false,
  });

  return `${timeStr}${ranStr}`;
};

/**
 * ramdom voucher code
 * @param num number of codes need to random
 * @returns
 */
export const generateVouchercode = (num: number) => {
  return generator.generateMultiple(num, {
    length: 16,
    numbers: true,
    symbols: false,
  });
};
