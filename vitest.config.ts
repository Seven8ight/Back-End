import { defineConfig } from "vitest/config";
import * as path from "path";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "Expense Tracker API",
          root: path.join(__dirname, "Expense Tracker API"),
          environment: "node",
        },
      },
    ],
  },
});
