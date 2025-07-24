import { QueryResult, type Client } from "pg";
import { generateToken, tokens } from "../Authentication/Auth";
import crypto from "crypto";

export type userDetails = {
  name: string;
  email: string;
  password: string;
};
type expense = {
  category: string;
  title: string;
  description: string;
  amount: number;
  createdDate: Date;
  lastUpdated: Date;
};

export class PostGresDB {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async tableExists(table: "users" | "expenses"): Promise<Error | boolean> {
    try {
      await this.client.query(
        `SELECT * FROM ${table == "users" ? "users" : "expenses"}`
      );

      return true;
    } catch (error) {
      return error;
    }
  }

  //User
  async createUser(userDetails: userDetails): Promise<string | tokens | Error> {
    const nullFinder = Object.entries(userDetails).find(
        (pair) => pair[1].length <= 0
      ),
      presentKeys = Object.keys(userDetails),
      fieldsPresent =
        presentKeys.length == 3 &&
        ["name", "email", "password"].every((key) => presentKeys.includes(key));

    if (nullFinder) return `${nullFinder[0]} has no value provided`;
    if (!fieldsPresent)
      return `Incomplete fields, please provide all fields i.e. name, email and password.`;

    try {
      const userId = crypto.randomUUID();

      if (await this.tableExists("users")) {
        await this.client.query(
          "INSERT INTO users(id,name,email,password) VALUES($1,$2,$3,$4)",
          [userId, userDetails.name, userDetails.email, userDetails.password]
        );

        return generateToken({ id: userId, userDetails });
      } else {
        return new Promise(async (resolve, reject) => {
          try {
            await this.client.query(
              "CREATE TABLE users(id UUID, name TEXT, email VARCHAR(100), password VARCHAR(100));"
            );

            await this.client.query(
              "INSERT INTO users(id,name,email,password) VALUES($1,$2,$3,$4)",
              [
                userId,
                userDetails.name,
                userDetails.email,
                userDetails.password,
              ]
            );

            resolve(generateToken({ id: userId, userDetails }));
          } catch (error) {
            reject(error);
          }
        });
      }
    } catch (error) {
      return error;
    }
  }

  async getUser(userId: string): Promise<userDetails | string | Error> {
    try {
      if (await this.tableExists("users")) {
        const getUserQuery: QueryResult = await this.client.query(
          "SELECT * FROM users WHERE id::text=$1",
          [userId]
        );
        return getUserQuery.rows[0];
      } else {
        await this.client.query(
          "CREATE TABLE users(id UUID, name TEXT, email VARCHAR(100), password VARCHAR(100));"
        );

        return "User table does not exist";
      }
    } catch (error) {
      return error;
    }
  }

  async updateUser(
    userId: string,
    newDetails: userDetails
  ): Promise<string | Error> {
    try {
      if (await this.tableExists("users")) {
        const userQuery = await this.client.query(
          "SELECT * FROM users WHERE id::text=$1",
          [userId]
        );

        if (!userQuery) return "User does not exist";

        for (let [key, value] of Object.entries(newDetails)) {
          if (value.length == 0) return `${key} has an empty value`;
        }

        for (let [key, value] of Object.entries(newDetails)) {
          await this.client.query(
            `UPDATE users SET ${key}=$1 WHERE id::text=$2`,
            [value, userId]
          );
        }

        return "Update successful";
      } else {
        await this.client.query(
          "CREATE TABLE users(id UUID, name TEXT, email VARCHAR(100), password VARCHAR(100));"
        );
        return "User table doesn't exist";
      }
    } catch (error) {
      return error;
    }
  }

  async deleteUser(userId: string): Promise<string | Error> {
    try {
      if (await this.tableExists("users")) {
        const userQuery = await this.client.query(
          "SELECT * FROM users WHERE id::text=$1",
          [userId]
        );

        if (!userQuery) return "User does not exist";

        const deleteQuery = await this.client.query(
          `DELETE FROM users WHERE id::text=$1`,
          [userId]
        );

        if (deleteQuery.rowCount && deleteQuery.rowCount > 1)
          return "Deletion successful";
        else return "User already deleted";
      } else {
        await this.client.query(
          "CREATE TABLE users(id UUID, name TEXT, email VARCHAR(100), password VARCHAR(100));"
        );
        return "User table doesn't exist";
      }
    } catch (error) {
      return error;
    }
  }

  //Expenses
  async createExpense(userId: string, expense: expense) {}

  async updateExpense() {}

  async deleteExpense() {}

  async getExpenses() {}

  async getExpensesByCategory() {}
}
