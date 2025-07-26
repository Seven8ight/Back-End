import { beforeAll, describe, expect, it, MockInstance, vi } from "vitest";
import { PostGresDB, type expense } from "../Database/Postgres";
import * as pg from "pg";

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

describe.skip("User Operations", () => {
  let postGres: PostGresDB,
    functions: {
      createUser: MockInstance;
      updateUser: MockInstance;
      getUser: MockInstance;
      deleteUser: MockInstance;
    };

  beforeAll(async () => {
    const pgClient = new pg.Client({
      host: "localhost",
      port: 5432,
      database: "expense_tracker",
    });

    postGres = new PostGresDB(pgClient);
    functions = {
      createUser: vi.spyOn(postGres, "createUser"),
      updateUser: vi.spyOn(postGres, "updateUser"),
      deleteUser: vi.spyOn(postGres, "deleteUser"),
      getUser: vi.spyOn(postGres, "getUser"),
    };

    await pgClient.connect();
  });

  it("Creating a user", async () => {
    const result = await postGres.createUser({
      name: "Sammy Ndyareeba",
      email: "sm@g.com",
      password: "1234567",
    });

    expect(functions.createUser).toHaveBeenCalled();
    // expect(result).toEqual({
    //   accessToken: expect.any(String),
    //   refreshToken: expect.any(String),
    // });
    expect(result).toStrictEqual(new Error("Email already exists"));
  });

  it("Updating a user", async () => {
    const result = await postGres.updateUser(
      "dd0d2a93-3e68-4cf0-9269-c3e153ac864c",
      {
        email: "llmwuchiri23@gmail.com",
      }
    );

    expect(functions.updateUser).toHaveBeenCalled();
    expect(result).toEqual("Update successful");
  });

  it.skip("Deleting a user", async () => {
    // functions.deleteUser.mockResolvedValue("User already deleted");

    const result = await postGres.deleteUser(
      "dd0d2a93-3e68-4cf0-9269-c3e153ac864c"
    );

    expect(functions.deleteUser).toHaveBeenCalled();
    expect(result).toBe("User already deleted");
  });

  it("Retrieving a user", async () => {
    const result = await postGres.getUser(
      "dd0d2a93-3e68-4cf0-9269-c3e153ac864c"
    );

    expect(functions.getUser).toHaveBeenCalled();
    expect(result).toEqual({
      id: expect.any(String),
      name: expect.any(String),
      email: expect.any(String),
    });
  });
});

describe("Expense operations", () => {
  let postGres: PostGresDB,
    functions: {
      createExpense: MockInstance;
      updateExpense: MockInstance;
      getExpense: MockInstance;
      getExpenses: MockInstance;
      deleteExpense: MockInstance;
      clearExpenses: MockInstance;
    };

  beforeAll(async () => {
    const pgClient = new pg.Client({
      host: "localhost",
      port: 5432,
      database: "expense_tracker",
    });

    postGres = new PostGresDB(pgClient);
    functions = {
      createExpense: vi.spyOn(postGres, "createExpense"),
      updateExpense: vi.spyOn(postGres, "updateExpense"),
      getExpense: vi.spyOn(postGres, "getExpense"),
      getExpenses: vi.spyOn(postGres, "getExpenses"),
      deleteExpense: vi.spyOn(postGres, "deleteExpense"),
      clearExpenses: vi.spyOn(postGres, "clearExpenses"),
    };

    await pgClient.connect();
  });

  it("Creating of expenses", async () => {
    const result = await postGres.createExpense(
      "dd0d2a93-3e68-4cf0-9269-c3e153ac864c",
      {
        title: "Expense 1",
        category: "expenses",
        description: "something",
        amount: 1560,
        createdAt: new Date(),
        lastUpdated: new Date(),
      }
    );

    expect(functions.createExpense).toHaveBeenCalled();
    expect(result).toBe("Expense created");
  });

  it.skip("Updating expenses", async () => {
    const result = await postGres.updateExpense(
      "dd0d2a93-3e68-4cf0-9269-c3e153ac864c",
      "e08e6ccb-4b67-4a78-9b66-31c6e6c7af41",
      {
        title: "retry that thing again",
        description: "Dope Ceasar",
      }
    );

    expect(functions.updateExpense).toHaveBeenCalled();
    expect(result).toBe("Update successful");
  });

  it.skip("Deleting expenses", async () => {
    const result = await postGres.deleteExpense(
      "dd0d2a93-3e68-4cf0-9269-c3e153ac864c",
      "b936c252-a1ac-428f-a70e-439cb5c38d2e"
    );

    expect(functions.deleteExpense).toHaveBeenCalled();
    expect(result).toBe("Expense does not exist");
  });

  it.skip("Clearing expenses", async () => {
    const result = await postGres.clearExpenses(
      "dd0d2a93-3e68-4cf0-9269-c3e153ac864c"
    );

    expect(functions.clearExpenses).toHaveBeenCalled();
    expect(result).toBe("Already deleted");
  });

  it("Fetch Expense", async () => {
    const result = await postGres.getExpense(
      "dd0d2a93-3e68-4cf0-9269-c3e153ac864c",
      "e601daed-9194-4e4b-a2b5-998d9abd2752"
    );

    expect(functions.getExpense).toHaveBeenCalled();
    expect(result).toEqual({
      id: expect.any(String),
      userid: expect.any(String),
      category: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      amount: expect.any(Number),
      createdat: expect.any(Date),
      lastupdated: expect.any(Date),
    });
  });

  it("Fetch Expenses", async () => {
    const result = await postGres.getExpenses(
      "dd0d2a93-3e68-4cf0-9269-c3e153ac864c"
    );

    expect(functions.getExpenses).toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);

    (result as expense[]).forEach((expense) => {
      expect(expense).toHaveProperty("id");
      expect(expense).toHaveProperty("userid");
      expect(expense).toHaveProperty("category");
      expect(expense).toHaveProperty("title");
      expect(expense).toHaveProperty("amount");
      expect(expense).toHaveProperty("description");
      expect(expense).toHaveProperty("createdat");
      expect(expense).toHaveProperty("lastupdated");
      expect(expense).toHaveProperty("amount");
    });
  });
});
