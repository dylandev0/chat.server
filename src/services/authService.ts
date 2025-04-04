import { decryptTokenCode } from '@/utils/cryptohash';

/**
 * get current user info by access token data
 * @param data
 * @returns
 */
export const getUserAccessToken = async (data: any) => {
  try {
    // get user from token
    const account = decryptTokenCode(data.ec ?? '', data.se ?? '');

    return {
      name: account,
    };
  } catch (err: any) {
    console.log('get current user fail');
    return false;
  }
};
