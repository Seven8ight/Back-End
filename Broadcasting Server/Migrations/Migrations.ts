import fs from "fs/promises";
import path from "path";
import { pg } from "../Config/Database";
import { Info } from "../Utils/Logger";

const MIGRATIONS_DIR = path.join(__dirname, "SQL TABLES");

(async () => {
  try {
    const sqlFiles = (await fs.readdir(MIGRATIONS_DIR))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (let fileName of sqlFiles) {
      const sqlFile = await fs.readFile(path.join(MIGRATIONS_DIR, fileName), {
        encoding: "utf-8",
      });

      await pg.query(sqlFile);

      Info(`${fileName} querried and created successfully`);
    }

    process.exit(0);
  } catch (error) {
    Error(`${(error as Error).message}`);
    process.exit(1);
  }
})();
