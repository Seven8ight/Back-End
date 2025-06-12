import jwt, { JwtPayload } from "jsonwebtoken";
import { UserDetails } from "../Database/Postgres";

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
        }
      ),
      refreshToken = jwt.sign(details, process.env.JWT_REFRESH_TOKEN as string);

    return { accessToken, refreshToken };
  },
  verifyUser = (token: string): string | boolean | JwtPayload => {
    const decodedUser = jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN as string
    );

    if (!decodedUser) return false;
    return decodedUser;
  },
  refreshToken = (
    token: string
  ): string | Omit<SecurityCredentials, "refreshToken"> => {
    const verification = jwt.verify(
      token,
      process.env.JWT_REFRESH_TOKEN as string
    );

    if (!verification) return "Invalid token";

    const accessToken = jwt.sign(
      verification,
      process.env.JWT_ACCESS_TOKEN as string,
      { expiresIn: "900s" }
    );

    return {
      accessToken,
    };
  };
