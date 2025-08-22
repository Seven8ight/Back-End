import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(path.resolve(__dirname, "../"), ".env") });

export type tokens = {
  accessToken: string;
  refreshToken: string;
};

const accessSignature = process.env.JWT_ACCESS_TOKEN,
  refreshSignature = process.env.JWT_REFRESH_TOKEN;

export const generateToken = (payload: Object): tokens | Error => {
    try {
      return {
        accessToken: jwt.sign(payload, accessSignature as string),
        refreshToken: jwt.sign(payload, refreshSignature as string),
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
  refreshAccessToken = (
    refreshToken: string
  ): string | Omit<tokens, "refreshToken"> | Error => {
    try {
      const verifyToken = jwt.verify(refreshToken, refreshSignature as string);

      if (verifyToken)
        return {
          accessToken: jwt.sign(verifyToken, accessSignature as string),
        };

      return "Refresh Token invalid, refresh failed";
    } catch (error) {
      return error;
    }
  };
