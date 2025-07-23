import { type Client } from "pg";

export class PostGresDB {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  //User
  async createUser() {}

  async getUser() {}

  async updateUser() {}

  async deleteUser() {}

  //Expenses
  async createExpense() {}

  async updateExpense() {}

  async deleteExpense() {}

  async getExpenses() {}

  async getExpensesByCategory() {}
}
