import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(__dirname, ".env"),
});

export const SERVER_PORT = process.env.SERVER_PORT,
  PG_USER = process.env.POSTGRES_USERNAME,
  PG_PASSWORD = process.env.POSTGRES_PASSWORD,
  PG_DATABASE = process.env.POSTGRES_DATABASE;
