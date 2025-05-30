import { type Client } from "pg";

export type Blog = {
  title: string;
  content: string;
  category: string;
  tags: string[];
};

export class DB {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async createBlog(blog: Blog): Promise<Error | string> {
    return new Promise(async (resolve, reject) => {
      let insertionQuery = await this.client.query(
        "INSERT INTO blogs(title,content,category,tags) VALUES($1,$2,$3,$4)",
        [blog.title, blog.content, blog.category, blog.tags]
      );

      if (insertionQuery instanceof Error) reject(insertionQuery);
      else resolve("Created");
    });
  }

  async updateBlog(
    id: string,
    newDetails: Partial<Blog>
  ): Promise<Error | string> {
    return new Promise((resolve, reject) => {
      try {
        const updaterFunction = async (key: string, value: any) =>
          await this.client.query(
            `UPDATE blogs SET ${key}=$1 WHERE id::text=$2;`,
            [value, id]
          );

        for (let [key, value] of Object.entries(newDetails))
          updaterFunction(key, value);

        resolve("Success");
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteBlog(id: string): Promise<Error | any> {
    return new Promise(async (resolve, reject) => {
      let blogFinder = await this.client.query(
        "SELECT * FROM blogs WHERE id::text=$1",
        [id]
      );

      if (blogFinder instanceof Error)
        reject(
          JSON.stringify({
            message: "Does not exist",
          })
        );
      else {
        let deletionQuery = await this.client.query(
          "DELETE FROM blogs WHERE id::text=$1",
          [id]
        );

        if (deletionQuery instanceof Error) reject(deletionQuery);
        else resolve(deletionQuery.rowCount);
      }
    });
  }

  async getBlogs(): Promise<Error | any> {
    return new Promise(async (resolve, reject) => {
      let blogs = await this.client.query("SELECT * FROM blogs");

      if (blogs instanceof Error) reject(blogs);
      else resolve(blogs.rows);
    });
  }

  async specificBlog(id: string): Promise<Error | any> {
    return new Promise(async (resolve, reject) => {
      let blog = await this.client.query(
        "SELECT * FROM blogs where id::text=$1",
        [id]
      );

      if (blog instanceof Error) reject(blog);
      else resolve(blog.rows);
    });
  }

  async getBlogByTag(tags: string[] | string): Promise<Error | any> {
    return new Promise(async (resolve, reject) => {
      let blog = await this.client.query(
        "SELECT * FROM blogs WHERE tags @> ARRAY[$1];",
        [Array.isArray(tags) ? [...tags].join(", ") : tags]
      );

      if (blog instanceof Error) reject(blog);
      else resolve(blog.rows);
    });
  }
}
