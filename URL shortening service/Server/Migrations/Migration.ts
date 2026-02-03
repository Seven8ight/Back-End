import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { pgClient } from "../Config/Config.js";

const __filename = fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename),
  __sqlfiles = path.join(__dirname, "/SQL");

const Migrations = async () => {
  const files = (await fs.readdir(__sqlfiles)).sort();

  for (let file of files) {
    const sql = await fs.readFile(path.join(__sqlfiles, file), {
      encoding: "utf-8",
    });

    await pgClient.query(sql);

    process.stdout.write(`${file} has been queried successfully\n`);
  }

  process.stdout.write("Migrations complete");
};

(async () => await Migrations())();
