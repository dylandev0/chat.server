const jwt = require('jsonwebtoken');

/**
 * generate session token for google login
 * @param data
 * @returns
 */
export const generateSessionToken = (data: any) => {
  return jwt.sign(data, process.env.SECRET_ACCESS_TOKEN, {
    expiresIn: '1 days',
  });
};

/**
 * raise jwt access token with params
 * @param name string
 * @param emailCode string // email had been encrypt
 * @param session string
 * @returns
 */
export const generateAccessToken = (
  name: String,
  emailCode: string,
  session: string,
  expires: string = '2h'
) => {
  const data = {
    name: name,
    ec: emailCode,
    se: session,
  };
  return jwt.sign(data, process.env.SECRET_ACCESS_TOKEN, {
    expiresIn: expires,
  });
};

/**
 * verify and decode jwt access token
 * @param token string
 * @returns
 */
export const verifyAccessToken = async (token: string) => {
  try {
    const decoded = await jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
    return decoded;
  } catch (err) {
    return false;
  }
};
