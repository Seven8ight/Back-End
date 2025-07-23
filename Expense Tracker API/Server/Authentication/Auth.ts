import * as jwt from "jsonwebtoken";

const accessSignature = process.env.JWT_ACCESS_TOKEN,
  refreshSignature = process.env.JWT_REFRESH_TOKEN;

export const generateToken = (payload: Object): Object | Error => {
    try {
      return {
        accessTokens: jwt.sign(payload, accessSignature as string),
        refreshTokens: jwt.sign(payload, refreshSignature as string),
      };
    } catch (error) {
      return error;
    }
  },
  verifyAccessToken = (token: string): string | Object | Error => {
    try {
      const decryption = jwt.verify(token, accessSignature as string);

      if (decryption) return decryption;

      return "Invalid Access Token";
    } catch (error) {
      return error;
    }
  },
  refreshAccessToken = (refreshToken: string): string | Object | Error => {
    try {
      const verifyToken = jwt.verify(refreshToken, refreshSignature as string);

      if (verifyToken) return jwt.sign(verifyToken, accessSignature as string);

      return "Refresh Token invalid, refresh failed";
    } catch (error) {
      return Error;
    }
  };
