import { Client } from "pg";
import { PG_DATABASE, PG_PASSWORD, PG_USER } from "./Env";

export const pg = new Client({
    user: PG_USER,
    password: PG_PASSWORD,
    database: PG_DATABASE,
  }),
  connectDatabase = async () => await pg.connect();
