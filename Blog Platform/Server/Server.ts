import * as http from "http";
import { Client } from "pg";
import { createClient } from "redis";
import { DB } from "./Database/Postgres";
import dotenv from "dotenv";
import URL from "url";
import { CacheDB } from "./Database/Redis";

dotenv.config({
  path: "./env",
});

export const redisClient = createClient();
const pgClient: Client = new Client({
  host: "localhost",
  port: 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: "blogs",
});

const jsonReader = async (data: any): Promise<Error | any> => {
    return new Promise(async (resolve, reject) => {
      try {
        let incomingData = JSON.parse(data);

        resolve(incomingData);
      } catch (error) {
        reject(error);
      }
    });
  },
  server = http.createServer(
    async (
      request: http.IncomingMessage,
      response: http.ServerResponse<http.IncomingMessage>
    ) => {
      const url = URL.parse(request.url as string),
        routeSegment = (url.pathname as string).split("/").filter(Boolean);

      response.setHeader(
        "Access-Control-Allow-Origin",
        "http://localhost:5173"
      );
      response.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, accept"
      );

      if (request.method == "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }
      switch (routeSegment[0]) {
        case "blogs":
          const blogDB = new DB(pgClient),
            cacheDB = new CacheDB();

          switch (routeSegment[1]) {
            case "list":
              const getCachedBlogs = await redisClient.get("All blogs");

              if (getCachedBlogs == null) {
                const blogs = await blogDB.getBlogs();

                if (redisClient.isReady) await cacheDB.saveBlogs(blogs);

                if (blogs instanceof Error) {
                  response.writeHead(500);
                  response.end(
                    JSON.stringify({
                      message: "Error in retrieving blogs",
                    })
                  );
                  return;
                } else {
                  response.writeHead(200, {
                    "content-type": "application/json",
                  });
                  response.end(JSON.stringify(blogs));
                  return;
                }
              } else {
                response.writeHead(200);
                response.end(
                  JSON.stringify({
                    Blogs: getCachedBlogs,
                  })
                );
                return;
              }
            case "create":
              if (request.method == "POST") {
                let incomingData: any = "";

                request.on("data", (data: Buffer) => {
                  incomingData += data.toString();
                });

                request.on("end", async () => {
                  let blogData = await jsonReader(incomingData);

                  if (blogData instanceof Error) {
                    response.writeHead(409);
                    response.end(
                      JSON.stringify({
                        message: "Invalid json parsed in",
                      })
                    );
                    return;
                  }

                  let blogInsertion = await blogDB.createBlog(blogData);

                  if (blogInsertion instanceof Error) {
                    response.writeHead(500);
                    response.end(
                      JSON.stringify({
                        message: "Blog insertion unsuccessful",
                      })
                    );
                  } else {
                    const blogsCached = await redisClient.get("All blogs");

                    if (blogsCached != null) {
                      await redisClient.expire("All blogs", 1);
                      await cacheDB.saveBlogs(await blogDB.getBlogs());
                    }

                    response.writeHead(201);
                    response.end(
                      JSON.stringify({ message: "Blog created successfully" })
                    );
                  }

                  return;
                });
              } else {
                response.writeHead(405);
                response.end(
                  JSON.stringify({
                    message:
                      "Invalid method, try post instead with a json body",
                  })
                );
                return;
              }

              break;
            case "update":
              if (request.method == "PUT") {
                let blogUpdateId = routeSegment[2],
                  incomingData: any = "";

                request.on("data", (data: Buffer) => {
                  incomingData += data.toString();
                });
                request.on("end", async () => {
                  let updateData = await jsonReader(incomingData);

                  if (updateData instanceof Error) {
                    response.writeHead(405);
                    response.end(
                      JSON.stringify({
                        message: "Ensure to pass in valid json data",
                      })
                    );
                    return;
                  }

                  let updateQuery = await blogDB.updateBlog(
                      blogUpdateId,
                      updateData
                    ),
                    updatedBlog = await blogDB.specificBlog(blogUpdateId);

                  if (updateQuery instanceof Error) {
                    response.writeHead(500);
                    response.end(
                      JSON.stringify({
                        message: "Server error, please try again",
                      })
                    );
                    return;
                  }

                  await cacheDB.saveBlogs(await blogDB.getBlogs());

                  response.writeHead(200);
                  response.end(
                    JSON.stringify({
                      updatedBlog,
                    })
                  );
                });
              } else {
                response.writeHead(405);
                response.end(
                  JSON.stringify({
                    message: "Pass in a different route method",
                  })
                );
              }
              break;
            case "delete":
              let blogDId = routeSegment[2],
                blogDeletion = await blogDB.deleteBlog(blogDId);

              if (blogDeletion instanceof Error) {
                response.writeHead(500);
                response.end(
                  JSON.stringify({
                    message: "Server error in deletion of blog",
                  })
                );
                return;
              }
              response.writeHead(204);
              response.end(
                JSON.stringify({
                  message: "Deletion successful",
                })
              );
              return;
            case "blog":
              const blogId = routeSegment[2],
                getBlog = await redisClient.hGetAll(blogId);

              if (Object.keys(getBlog).length == 0) {
                const blog = await blogDB.specificBlog(blogId);

                redisClient.isReady &&
                  (await cacheDB.saveBlog(blog[0], blogId));

                if (blog instanceof Error) {
                  response.writeHead(500);
                  response.end(
                    JSON.stringify({
                      message: "Server error, please try again",
                    })
                  );
                  return;
                } else {
                  response.writeHead(200);
                  response.end(JSON.stringify(blog[0]));
                  return;
                }
              } else {
                response.writeHead(200);
                response.end(JSON.stringify(getBlog));
                return;
              }
            case "tags":
              const urlQuery = (url.query as string).slice(
                  1,
                  (url.query as string).length
                ),
                queries = urlQuery.includes("&")
                  ? urlQuery.split("&")
                  : urlQuery;

              const getBlogByTag = await redisClient.get(
                typeof queries == "string" ? queries : queries.join(", ")
              );

              if (getBlogByTag == null) {
                const blogTags = await blogDB.getBlogByTag(queries);

                if (redisClient.isReady)
                  await cacheDB.saveBlogsByTags(queries, blogTags);

                if (blogTags instanceof Error) {
                  response.writeHead(500);
                  response.end(
                    JSON.stringify({
                      message: "Server error in parsing tags check again",
                    })
                  );
                } else {
                  response.writeHead(200);
                  response.end(
                    JSON.stringify({
                      "Blog Tags": blogTags,
                    })
                  );
                }
              } else {
                response.writeHead(200);
                response.end(
                  JSON.stringify({
                    "Blog tags": (getBlogByTag as string).replace(/\g/, ""),
                  })
                );
              }

              break;
            default:
              response.writeHead(200);
              response.end(
                JSON.stringify({
                  message: "Ensure to pass in a route here",
                })
              );
              break;
          }
          break;
        default:
          response.writeHead(200, {
            "content-type": "application/json",
          });
          response.end(
            JSON.stringify({
              message: "Connection successful",
            })
          );
          break;
      }
    }
  );

server.listen(process.env.PORT || 3000, async () => {
  await redisClient.connect();
  await pgClient.connect();

  let tableExists = await pgClient.query("SELECT * FROM blogs");

  if (tableExists instanceof Error) {
    console.log("Table does not exist, creating table");
    await pgClient
      .query(
        "CREATE TABLE blogs(title VARCHAR(100), content TEXT, category TEXT, tags TEXT[]);"
      )
      .then(() => {
        process.stdout.write("Table created successfully");
      })
      .catch((error) => {
        process.stdout.write("Error in creating table");
        console.log(error);
      });
  }

  if (redisClient.isReady && pgClient.user)
    process.stdout.write("Database, Cache and server are up and running\n");
  else if (!redisClient.isReady)
    process.stdout.write(
      "Cache server unavailable, Database and server are up and running\n"
    );
});

process.on("uncaughtException", (error) => {
  console.log(error);
});
process.on("unhandledRejection", (error) => {
  console.log(error);
});
