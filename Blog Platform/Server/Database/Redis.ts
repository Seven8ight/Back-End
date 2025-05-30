import { redisClient } from "../Server";
import { type Blog } from "./Postgres";

export class CacheDB {
  async saveBlogs(Blogs: Blog[]) {
    return await redisClient.setEx(
      "All blogs",
      3600,
      JSON.stringify([...Blogs])
    );
  }

  async saveBlog(blog: Blog, id: string) {
    return await redisClient.hSet(id, {
      title: blog.title,
      content: blog.content,
      category: blog.category,
      tags: JSON.stringify(blog.tags),
    });
  }

  async saveBlogsByTags(tags: string | string[], Blogs: Blog[]) {
    return await redisClient.setEx(
      `${Array.isArray(tags) ? tags.join(", ") : tags}`,
      3600,
      JSON.stringify([...Blogs])
    );
  }
}
