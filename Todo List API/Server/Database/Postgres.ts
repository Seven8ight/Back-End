import pg, { QueryResult } from "pg";
import {
  generateToken,
  verifyUser,
  SecurityCredentials,
} from "../Authentication/Auth";

export type UserDetails = {
  id?: string;
  name: string;
  email: string;
  password: string;
};

export class Database {
  Client: pg.Client;

  constructor(client: pg.Client) {
    this.Client = client;
  }

  //Users
  async tableExists(table: "user" | "todos"): Promise<boolean> {
    try {
      let rows: QueryResult<any> | null = null;

      if (table == "user")
        rows = await this.Client.query("SELECT * FROM users");
      else await this.Client.query("SELECT * FROM todos");

      if (Array.isArray(rows)) return true;

      return false;
    } catch (error) {
      return false;
    }
  }

  async registration(
    details: UserDetails
  ): Promise<string | SecurityCredentials> {
    if (!(await this.tableExists("user"))) {
      try {
        await this.Client.query(
          "CREATE TABLE users(id UUID DEFAULT uuid_generate_v4(), name VARCHAR(100), email VARCHAR(100) UNIQUE, password TEXT);"
        );
      } catch (error) {
        return (error as Error).message;
      }
    }

    try {
      await this.Client.query(
        "INSERT INTO users(name,email,password) VALUES($1,$2,$3);",
        [details.name, details.email, details.password]
      );

      return generateToken(
        (
          await this.Client.query("SELECT * FROM users WHERE email=$1", [
            details.email,
          ])
        ).rows[0]
      );
    } catch (error) {
      return (error as Error).message;
    }
  }

  async login(
    details: Omit<UserDetails, "name">
  ): Promise<UserDetails | string | SecurityCredentials> {
    if (!(await this.tableExists("user")))
      try {
        await this.Client.query(
          "CREATE TABLE users(id UUID DEFAULT uuid_generate_v4(), name VARCHAR(100), email VARCHAR(100) UNIQUE, password TEXT);"
        );
        return "User table non-existent";
      } catch (error) {
        return error;
      }
    else {
      let userFinder: QueryResult<any> = await this.Client.query(
        "SELECT * FROM users WHERE email=$1",
        [details.email]
      );

      if (userFinder.rows.length == 0) return "User does not exist";
      else {
        if (userFinder.rows[0].password == details.password)
          return generateToken(
            (
              await this.Client.query("SELECT * FROM users WHERE email=$1", [
                details.email,
              ])
            ).rows[0]
          );
        else return "Incorrect password";
      }
    }
  }

  //Todo lists
  async createTodo(
    token: string,
    { title, description }: { title: string; description: string }
  ): Promise<boolean | string> {
    const user = verifyUser(token);

    if (typeof user == "boolean") return "Token passed is invalid";

    if (!(await this.tableExists("todos")))
      await this.Client.query(
        "CREATE TABLE todos (id DEFAULT uuid_generate_v4(),userId uuid REFERENCES user(id),title TEXT, description TEXT);"
      );

    if (title.length > 0 && description.length > 0) {
      const decodedUser: UserDetails = JSON.parse(user as string);

      await this.Client.query(
        "INSERT INTO todos(title,description,userId) VALUES($1,$2,$3);",
        [title, description, decodedUser.id]
      );
    } else return "incomplete credentials";

    return true;
  }

  async getTodos(token: string): Promise<string | any> {
    const user = verifyUser(token);

    if (typeof user == "boolean") return "Token passed is invalid";

    try {
      if (!(await this.tableExists("todos"))) return "Table non existent";

      return await this.Client.query(
        `SELECT * FROM todos WHERE userId::text=${(user as UserDetails).id}`
      );
    } catch (error) {
      return (error as Error).message;
    }
  }

  async updateTodo(
    token: string,
    {
      id,
      title,
      description,
    }: { id: string; title?: string; description?: string }
  ): Promise<boolean | string> {
    const user = verifyUser(token);

    if (typeof user == "boolean") return "Token does not exist";

    if (!id) return "Id should be provided";

    for (let [key, value] of Object.entries(
      Object.create({ title, description })
    )) {
      if (value && (value as string).length > 0)
        await this.Client.query(
          `UPDATE todos WHERE id::text=${id} SET ${key}=${value}`
        );
    }

    return true;
  }

  async deleteTodo({
    token,
    title,
  }: {
    token: string;
    title: string;
  }): Promise<string | any> {
    const user = verifyUser(token);

    if (typeof user == "boolean") return "Token passed is invalid";

    if (!token || !title) return "Incomplete credentials";

    try {
      if (!(await this.tableExists("todos"))) return "Table non-existent";

      await this.Client.query(
        `DELETE FROM todos where title=${title} AND id::text=${
          (user as UserDetails).id
        }`
      );

      return "Delete successful";
    } catch (error) {
      return (error as Error).message;
    }
  }
}
