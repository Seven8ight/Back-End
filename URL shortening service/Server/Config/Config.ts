import { Client } from "pg";
import { createClient } from "redis";
import { PG_DB, PG_PASSWORD, PG_USERNAME } from "./Env.js";

export const pgClient = new Client({
    user: PG_USERNAME,
    password: PG_PASSWORD,
    database: PG_DB,
  }),
  redisClient = createClient();

export const ConnectToServices = async () => {
  try {
    await pgClient.connect();
    await redisClient.connect();
  } catch (error) {
    process.stdout.write(`${(error as Error).message}`);
  }
};
