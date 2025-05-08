import * as fs from "fs/promises";
import * as http from "http";
import * as ejs from "ejs";
import path from "path";
import * as URL from "url";

type article = {
  id: number;
  Header: string;
  Date: Date | string;
  Image: string;
  Content: {
    ArticleHeader: string;
    Content: string;
  }[];
};
type articleUpdateBody = {
  BlogTitle: string;
  ImageAddress: string;
  articleHeader: string;
  articleContent: string;
  articleId: number;
};
type user = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
};

const htmlFileReader = async (path: string) =>
    await fs.readFile(path, {
      encoding: "utf-8",
    }),
  blogsRenderer = async (): Promise<{ Blogs: article[] }> =>
    JSON.parse(
      await fs.readFile(path.join(__dirname, "Storage", "Blogs.json"), {
        encoding: "utf-8",
      })
    ),
  layoutRenderer = async (
    response: http.ServerResponse<http.IncomingMessage>,
    data: {}
  ) => {
    const layoutPage = await htmlFileReader(
      path.join(__dirname, "Client", "Layout.ejs")
    );

    if (typeof layoutPage !== "string")
      response.end("Failed to render page correctly, try again please");
    else response.end(ejs.render(layoutPage, data));
  };

const server = http.createServer(
  async (
    request: http.IncomingMessage,
    response: http.ServerResponse<http.IncomingMessage>
  ) => {
    let Blogs = (await blogsRenderer()).Blogs;

    switch (request.url) {
      case "/":
        response.writeHead(200, {
          "content-type": "text/html",
        });

        layoutRenderer(response, {
          title: "Incly Blogs",
          body: ejs.render(
            await htmlFileReader(
              path.join(__dirname, "Client", "Articles.ejs")
            ),
            {
              articles: Blogs,
            }
          ),
        });
        break;
      case "/auth":
        response.writeHead(200, {
          "content-type": "text/html",
        });
        response.end(
          ejs.render(
            await htmlFileReader(
              path.resolve(__dirname, "Client", "Accounts.ejs")
            )
          )
        );
        break;
      case "/auth/signup":
        let userData: any = "";

        request.on("data", (data: Buffer) => {
          userData += data.toString();
        });
        request.on("end", async () => {
          let users: { Users: user[] } = JSON.parse(
              await fs.readFile(path.join(__dirname, "Storage", "Users.json"), {
                encoding: "utf-8",
              })
            ),
            user: Omit<user, "id" & "role"> = JSON.parse(userData),
            userFinder = users.Users.find((User) => User.email == user.email);

          if (userFinder) {
            response.writeHead(200);
            response.end(
              JSON.stringify({
                message: "User exists",
              })
            );
            return;
          } else {
            users.Users.push({
              id: users.Users.length + 1,
              name: user.name,
              email: user.email,
              password: user.password,
              role: "user",
            });

            await fs
              .writeFile(
                path.join(__dirname, "Storage", "Users.json"),
                JSON.stringify(users)
              )
              .then(() => {
                response.writeHead(201);
                response.end(
                  JSON.stringify({
                    email: user.email,
                    name: user.name,
                    role: "user",
                  })
                );
              })
              .catch(() => {
                response.writeHead(500);
                response.end("Server error occured, try again please");
              });
            return;
          }
        });
        break;
      case "/auth/login":
        if (request.method == "POST") {
          let authData = "";

          request.on("data", (data: Buffer) => {
            authData += data.toString();
          });

          request.on("end", async () => {
            const users: { Users: user[] } = JSON.parse(
                await fs.readFile(
                  path.join(__dirname, "Storage", "Users.json"),
                  {
                    encoding: "utf-8",
                  }
                )
              ),
              user: Omit<user, "id"> = JSON.parse(authData),
              userFinder = users.Users.find((User) => User.email == user.email);

            if (userFinder) {
              if (userFinder.password == user.password) {
                response.writeHead(200);
                response.end(
                  JSON.stringify({
                    name: userFinder.name,
                    email: userFinder.email,
                    role: userFinder.role,
                  })
                );
              } else {
                response.writeHead(403);
                response.end(
                  JSON.stringify({
                    message: "Incorrect password",
                  })
                );
              }
            } else {
              response.writeHead(404);
              response.end(
                JSON.stringify({
                  message: "User does not exist",
                })
              );
            }

            return;
          });
        } else {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              message: "Pass in POST method for this one",
            })
          );
        }
        break;
      default:
        const blogs = await blogsRenderer();

        if (request.url) {
          const url = URL.parse(request.url),
            paths = (url.pathname as string).split("/").filter(Boolean);

          if (Number(paths[2]) > blogs.Blogs.length) {
            response.writeHead(404);
            response.end("Blog does not exist");
          }

          switch (paths[1]) {
            case "new":
              response.writeHead(200);
              response.end(
                ejs.render(
                  await htmlFileReader(
                    path.join(__dirname, "Client", "Admin", "New.ejs")
                  )
                )
              );
              break;
            case "view":
              let blog = blogs.Blogs[Number(paths[2]) - 1],
                articlePage = ejs.render(
                  await htmlFileReader(
                    path.join(__dirname, "Client", "Article.ejs")
                  ),
                  {
                    Header: blog.Header,
                    Date: blog.Date,
                    Image: blog.Image,
                    articles: blog.Content,
                    id: Number(paths[2]) - 1,
                  }
                );

              response.writeHead(200);
              response.end(articlePage);
              break;
            case "update":
              let blogUpdate = blogs.Blogs[Number(paths[2])],
                updatePage = ejs.render(
                  await htmlFileReader(
                    path.join(__dirname, "Client", "Admin", "Update.ejs")
                  ),
                  {
                    Header: blogUpdate.Header,
                    Image: blogUpdate.Image,
                    articles: blogUpdate.Content,
                    BlogId: Number(paths[2]),
                  }
                );
              response.writeHead(200);
              response.end(updatePage);
              break;
            case "delete":
              const Url = URL.parse(request.url as string),
                BlogToDelete = Number.parseInt(
                  Url.pathname?.split("/").filter(Boolean)[2] as string
                ),
                currentBlogs = (await blogsRenderer()).Blogs,
                deletedBlogs = currentBlogs.filter(
                  (_, index) => index != BlogToDelete
                );

              await fs
                .writeFile(
                  path.join(__dirname, "Storage", "Blogs.json"),
                  JSON.stringify({ Blogs: deletedBlogs })
                )
                .then(() => {
                  response.writeHead(204, "Deleted Successfully");
                  response.end("Arrived successfully");
                })
                .catch((error) => {
                  console.log(error);
                  response.writeHead(500, "Server failure");
                  response.end("Arrived successfully");
                });

              break;
            case "articlenew":
              let articleData: any = "";

              request.on("data", (data: Buffer) => {
                articleData += data.toString();
              });
              request.on("end", async () => {
                try {
                  articleData = JSON.parse(articleData);

                  let blogs: { Blogs: article[] } = JSON.parse(
                      await fs.readFile(
                        path.join(__dirname, "Storage", "Blogs.json"),
                        {
                          encoding: "utf-8",
                        }
                      )
                    ),
                    newBlog: article = {
                      id: blogs.Blogs.length + 1,
                      Header: "",
                      Date: `${new Date().getDate()}/${new Date().getMonth()}/${new Date().getFullYear()}`,
                      Image: "",
                      Content: [],
                    };

                  for (let [key, value] of Object.entries(articleData)) {
                    if (key == "Blogtitle") newBlog.Header = value as string;
                    else if (key == "Image") newBlog.Image = value as string;
                    else if (key == "Content") {
                      if (Array.isArray(value)) {
                        value.forEach(
                          (article: { Title: string; Content: string }) => {
                            newBlog.Content.push({
                              ArticleHeader: article.Title,
                              Content: article.Content,
                            });
                          }
                        );
                      }
                    }
                  }

                  blogs.Blogs.push(newBlog);

                  await fs
                    .writeFile(
                      path.join(__dirname, "Storage", "Blogs.json"),
                      JSON.stringify(blogs)
                    )
                    .then(() => {
                      response.writeHead(200);
                      response.end();
                      return;
                    })
                    .catch(() => {
                      response.writeHead(500);
                      response.end();
                      return;
                    });
                } catch (error) {
                  console.log(error);
                }
              });

              break;
            case "articleupdate":
              let url = URL.parse(request.url),
                blogId = Number.parseInt(
                  url.pathname?.split("/").filter(Boolean)[2] as string
                ),
                updateData: any = "";

              request.on("data", (data: Buffer) => {
                updateData += data.toString();
              });
              request.on("end", async () => {
                let newArticleContent: articleUpdateBody =
                    JSON.parse(updateData),
                  blogs: { Blogs: article[] } = JSON.parse(
                    await fs.readFile(
                      path.join(__dirname, "Storage", "Blogs.json"),
                      {
                        encoding: "utf-8",
                      }
                    )
                  );

                let newBlogs = {
                  Blogs: blogs.Blogs.map((Blog, index) => {
                    if (index === blogId) {
                      // Update blog title and image if provided
                      if (newArticleContent.BlogTitle.length > 0)
                        Blog.Header = newArticleContent.BlogTitle;
                      if (newArticleContent.ImageAddress.length > 0)
                        Blog.Image = newArticleContent.ImageAddress;

                      // Update the article inside this blog
                      const newUpdatedBlogArticles = Blog.Content.map(
                        (article, i) => {
                          if (i === newArticleContent.articleId)
                            if (
                              newArticleContent.articleContent.length > 0 &&
                              newArticleContent.articleHeader.length > 0
                            )
                              return {
                                ArticleHeader: newArticleContent.articleHeader,
                                Content: newArticleContent.articleContent,
                              };

                          return article; // unchanged
                        }
                      );

                      return { ...Blog, Content: newUpdatedBlogArticles };
                    } else return Blog;
                  }),
                };

                await fs
                  .writeFile(
                    path.join(__dirname, "Storage", "Blogs.json"),
                    JSON.stringify(newBlogs)
                  )
                  .then(() => {
                    response.writeHead(200);
                    response.end(
                      JSON.stringify({
                        message: "Successful update",
                      })
                    );
                  })
                  .catch((error) => {
                    console.log(error);
                    response.writeHead(500),
                      response.end("Error in updating article");
                  });
              });
              break;
            case "articledelete":
              let deleteData: any = "";

              request.on("data", (data: Buffer) => {
                deleteData += data.toString();
              });

              request.on("end", async () => {
                let deleteBody: { articleId: number } = JSON.parse(deleteData),
                  blogDId = Number.parseInt(
                    URL.parse(request.url as string)
                      .pathname?.split("/")
                      .filter(Boolean)[2] as string
                  ),
                  currentBlogs: { Blogs: article[] } = JSON.parse(
                    await fs.readFile(
                      path.join(__dirname, "Storage", "Blogs.json"),
                      { encoding: "utf-8" }
                    )
                  );

                let filteredBlogs = {
                  Blogs: currentBlogs.Blogs.map((Blog, index) => {
                    if (index == blogDId) {
                      const filteredBlogArticles = Blog.Content.filter(
                        (_, index) => index !== deleteBody.articleId
                      );
                      return { ...Blog, Content: filteredBlogArticles };
                    }
                    return Blog;
                  }),
                };

                await fs
                  .writeFile(
                    path.join(__dirname, "Storage", "Blogs.json"),
                    JSON.stringify(filteredBlogs)
                  )
                  .then(() => {
                    response.writeHead(200);
                    response.end();
                  })
                  .catch(() => {
                    response.writeHead(500);
                    response.end();
                  });
              });
              break;
            default:
              response.writeHead(404, "Route not found");
              response.end();
              break;
          }
        }
    }
  }
);

server.listen(3000, () => {
  console.log("Server is up and running at port 3000");
});

process.on("uncaughtException", (error) => {
  console.log(error);
});
