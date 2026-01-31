import dotenv from "dotenv";
dotenv.config({ path: path.join(path.resolve(__dirname, "..", ".env")) });

import jwt, { JwtPayload } from "jsonwebtoken";
import { UserDetails } from "../Database/Postgres";
import path from "path";

export type SecurityCredentials = {
  accessToken: string;
  refreshToken: string;
};

export const generateToken = (details: Partial<UserDetails>) => {
    const accessToken = jwt.sign(
        details,
        process.env.JWT_ACCESS_TOKEN as string,
        {
          expiresIn: "900s",
        },
      ),
      refreshToken = jwt.sign(
        details,
        process.env.JWT_REFRESH_TOKEN as string,
        {
          expiresIn: "2592000s",
        },
      );

    return { accessToken, refreshToken };
  },
  verifyUser = (token: string): string | JwtPayload | Error => {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_TOKEN as string);
    } catch (error) {
      return error;
    }
  },
  refreshToken = (
    token: string,
  ): string | Omit<SecurityCredentials, "refreshToken"> => {
    const verification = jwt.verify(
      token,
      process.env.JWT_REFRESH_TOKEN as string,
    );

    if (!verification) return "Invalid token";

    const accessToken = jwt.sign(
      verification,
      process.env.JWT_ACCESS_TOKEN as string,
    );

    return {
      accessToken,
    };
  };
