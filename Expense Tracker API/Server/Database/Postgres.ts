import { QueryResult, type Client } from "pg";
import { generateToken, tokens } from "../Authentication/Auth";
import crypto from "crypto";

export type userDetails = {
  name: string;
  email: string;
  password: string;
};
export type expense = {
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
  async createExpense(
    userId: string,
    expense: expense
  ): Promise<Error | string> {
    const expenseKeys = [
        "category",
        "title",
        "description",
        "amount",
        "createdDate",
        "lastUpdated",
      ],
      expenseParamKeys = Object.keys(expense),
      keysValidator =
        expenseParamKeys.length == expenseKeys.length &&
        expenseKeys.every((key) => expenseParamKeys.includes(key));

    for (let value of Object.values(expense)) {
      if (!value || value.toString().length <= 0)
        return "Ensure to provide a value in all fields";
    }

    if (keysValidator)
      try {
        const expenseId = crypto.randomUUID();

        await this.client.query(
          `INSERT INTO expenses(id, userId, ${Object.keys(expense).join(
            ", "
          )}) VALUES($1,$2,$3,$4,$5,$5,$6,$7,$8)`,
          [expenseId, userId, Object.values(expense).join(",")]
        );

        return "Expense created";
      } catch (error) {
        return error;
      }
    else return `Ensure to provide all fields i.e. ${expenseKeys.join(", ")}`;
  }

  async updateExpense(
    userId: string,
    expenseId: string,
    newExpenseDetails: Partial<expense>
  ): Promise<Error | string> {
    try {
      const expenseFinder = await this.client.query(
        "SELECT * FROM expenses e INNER JOIN users u ON e.userid=u.id WHERE e.id=$1 and u.id=$2",
        [expenseId, userId]
      );

      if (expenseFinder.rowCount && expenseFinder.rowCount > 0) {
        for (let [key, value] of Object.entries(newExpenseDetails)) {
          if (key != "createdAt" && key != "updatedAt" && key != "amount") {
            if (value.toString().length > 0)
              await this.client.query(
                `UPDATE expenses SET ${key}=$1 WHERE id::text=$2 AND userid::text=$3`,
                [value, expenseId, userId]
              );
            else return `${key} has an empty value`;
          } else {
            if (key == "createdAt" || key == "updatedAt") {
              if (value)
                await this.client.query(
                  `UPDATE expenses SET ${key}=DATE $1 WHERE id::text=$2 AND userid::text=$3`,
                  [value, expenseId, userId]
                );
              else return `${key} has an empty value`;
            } else {
              if (typeof value == "number" && value > 0) {
                await this.client.query(
                  `UPDATE expenses SET amount=$1 WHERE id::text=$2 AND userid::text=$3`,
                  [value, expenseId, userId]
                );
              } else
                return "Amount should have a valid integer inside and should be greater than 0";
            }
          }
        }
        return "Update successful";
      } else return "Expense not found";
    } catch (error) {
      return error;
    }
  }

  async deleteExpense(
    userId: string,
    expenseId: string
  ): Promise<string | Error> {
    try {
      const userFinder = await this.client.query(
          "SELECT * FROM users WHERE id::text=$1",
          [userId]
        ),
        expenseFinder = await this.client.query(
          "SELECT * FROM expenses WHERE id::text=$1",
          [expenseId]
        );

      if (
        userFinder.rowCount &&
        userFinder.rowCount > 0 &&
        expenseFinder.rowCount &&
        expenseFinder.rowCount > 0
      ) {
        await this.client.query(
          "DELETE FROM expenses WHERE id::text=$1 and userid::text=$2",
          [expenseId, userId]
        );
        return "Successful deletion";
      } else {
        if (userFinder.rowCount && userFinder.rowCount == 0)
          return "User does not exist";
        else return "Expense does not exist";
      }
    } catch (error) {
      return error;
    }
  }

  async getExpense(
    userId: string,
    expenseId: string
  ): Promise<Error | string | expense> {
    try {
      let expense = await this.client.query(
        "SELECT e.id,e.userid,e.title,e.description,e.category,e.amount,e.createdat,e.lastupdated FROM expenses e INNER JOIN users u ON e.userId=u.id WHERE e.id::text=$1 AND e.userid::text=$2",
        [expenseId, userId]
      );
      if (expense.rowCount && expense.rowCount > 0) return expense.rows[0];
      return "Not found";
    } catch (error) {
      return error;
    }
  }

  async getExpenses(userId: string): Promise<expense[] | Error | string> {
    try {
      let expense = await this.client.query(
        "SELECT e.id,e.userid,e.title,e.description,e.category,e.amount,e.createdat,e.lastupdated FROM expenses e INNER JOIN users u ON e.userId=u.id WHERE e.userid::text=$1",
        [userId]
      );
      if (expense.rowCount && expense.rowCount > 0) return expense.rows;
      return "Not found";
    } catch (error) {
      return error;
    }
  }

  async getExpensesByCategory(
    userId: string,
    category: string
  ): Promise<expense[] | Error | string> {
    try {
      let expense = await this.client.query(
        "SELECT e.id,e.userid,e.title,e.description,e.category,e.amount,e.createdat,e.lastupdated FROM expenses e INNER JOIN users u ON e.userId=u.id WHERE e.userid::text=$1 AND e.category=$2",
        [userId, category]
      );
      if (expense.rowCount && expense.rowCount > 0) return expense.rows;
      return "Not found";
    } catch (error) {
      return error;
    }
  }
}
