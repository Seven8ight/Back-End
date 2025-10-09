import { type userDetails, type expense } from "../Database/Postgres";
import { redisClient } from "../Server";

export class CacheDB {
  client: typeof redisClient;

  constructor(client: typeof redisClient) {
    this.client = client;
  }

  async saveUser(
    userId: string,
    userObject: userDetails
  ): Promise<string | Error> {
    try {
      const userTypeKeys = ["name", "email", "password"],
        userObjectKeys = Object.keys(userObject),
        keysChecker =
          userObjectKeys.length == 3 &&
          userObjectKeys.every((key) => userTypeKeys.includes(key));

      if (keysChecker) {
        const cacheStorage = await this.client.hSet(userId, {
          name: userObject.name,
          email: userObject.email,
          password: userObject.password,
        });

        this.client.expire(userId, 3600);
        if (cacheStorage > 0) return "Stored";
      }
      return "Ensure to provide all fields, name, email and password";
    } catch (error) {
      return error as Error;
    }
  }

  async saveExpense(
    expenseId: string,
    expense: expense
  ): Promise<string | Error> {
    try {
      const expenseObjKeys = [
          "category",
          "title",
          "description",
          "amount",
          "createdDate",
          "updatedAt",
        ],
        expenseParamkeys = Object.keys(expense),
        keyValidator =
          expenseParamkeys.length == expenseObjKeys.length &&
          expenseObjKeys.every((key) => expenseParamkeys.includes(key));

      if (keyValidator) {
        const cacheStorage = await this.client.hSet(expenseId, {
          title: expense.title,
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          createdDate: expense.createdAt.toUTCString(),
          lastUpdated: expense.updatedAt.toUTCString(),
        });

        this.client.expire(expenseId, 3600);

        if (cacheStorage > 0) return "Stored";
        return "Error occurred in caching the data";
      }

      return `Ensure to provide all fields necessary i.e. ${expenseObjKeys.join(
        ", "
      )}`;
    } catch (error) {
      return error as Error;
    }
  }

  async saveExpenses(
    userId: string,
    expenses: expense[]
  ): Promise<Error | string> {
    try {
      const cacheStorage = await this.client.set(
        `expenses-${userId}`,
        JSON.stringify(expenses)
      );
      if (cacheStorage?.toLowerCase() == "ok") return "Stored";
      return "Cache error, not stored";
    } catch (error) {
      return error as Error;
    }
  }

  async getUser(userId: string): Promise<Error | any> {
    try {
      const userRetrieval = await this.client.hGetAll(userId);

      if (Object.keys(userRetrieval).length == 0)
        return "Empty, no cache storage for user " + userId;
      return userRetrieval;
    } catch (error) {
      return error;
    }
  }

  async getExpenses(
    expenseId: string
  ): Promise<Error | string | { [x: string]: any }> {
    try {
      const expenseRetrieval = await this.client.hGetAll(expenseId);

      if (Object.keys(expenseRetrieval).length == 0)
        return "Empty, no cache storage for expense " + expenseId;
      return expenseRetrieval;
    } catch (error) {
      return error as Error;
    }
  }

  async getExpense(userId: string): Promise<Error | any> {
    try {
      const expensesRetrieval = await this.client.get(`expenses-${userId}`);

      if (expensesRetrieval) return JSON.parse(expensesRetrieval);
      return "Empty, no cache storage for expenses";
    } catch (error) {
      return error;
    }
  }

  async expireImmediate(cacheName: string) {
    let expiry = await this.client.expire(cacheName, 1);

    if (expiry >= 1) return "Uncached";
    return "Cache value doesn't exist";
  }
}
