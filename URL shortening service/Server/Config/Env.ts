import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

export const PG_USERNAME = process.env.POSTGRES_USERNAME,
  PG_PASSWORD = process.env.POSTGRES_PASSWORD,
  PG_DB = process.env.POSTGRES_DB,
  PORT = process.env.PORT;
