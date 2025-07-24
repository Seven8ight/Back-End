import { beforeAll, describe, expect, it, MockInstance, vi } from "vitest";
import { PostGresDB } from "../Database/Postgres";
import * as pg from "pg";

describe("Test 1", () => {
  it("Addition of numbers", () => expect(1 + 3).toBe(4));

  it("Subtraction of 2 numbers", () => expect(3 - 2).toBe(1));
});

describe("Database Operations", () => {
  let postgres: PostGresDB, functions: { tableExists: MockInstance };

  beforeAll(async () => {
    const pgClient = new pg.Client({
      host: "localhost",
      port: 5432,
      database: "expense_tracker",
    });
    postgres = new PostGresDB(pgClient);
    functions = { tableExists: vi.spyOn(postgres, "tableExists") };

    await pgClient.connect();
  });

  it("User Table existence", async () => {
    functions.tableExists.mockResolvedValue(false);

    const result = await postgres.tableExists("users");

    expect(functions.tableExists).toHaveBeenCalledOnce();
    expect(functions.tableExists).toHaveBeenLastCalledWith("users");
    expect(result).toBe(false);
  });

  it("Expense Table existence", async () => {
    functions.tableExists.mockResolvedValue(false);

    const result = await postgres.tableExists("expenses");

    expect(functions.tableExists).toHaveBeenCalled();
    expect(functions.tableExists).toHaveBeenLastCalledWith("expenses");
    expect(result).toBe(false);
  });
});
