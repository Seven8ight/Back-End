import * as fs from "fs/promises";
import * as http from "http";
import * as ejs from "ejs";
import path from "path";
import * as URL from "url";

type article = {
  id: number;
  Header: string;
  Date: Date;
  Image: string;
  Content: {
    ArticleHeader: string;
    Content: string;
  }[];
};
type user = {
  id: number;
  name: string;
  email: string;
  password: string;
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
              articles: (await blogsRenderer()).Blogs,
            }
          ),
        });
        break;
      case "/auth":
        const url = URL.parse(request.url),
          paths = (url.pathname as string).split("/").filter(Boolean);

        switch (paths[1]) {
          default:
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
          case "login":
            request.on("data", (account: Buffer) => {
              console.log(account.toString());
            });
            response.writeHead(201);
            response.end("Works");
            break;
          case "signup":
            request.on("data", (account: Buffer) => {
              console.log(account.toString());
            });
            response.writeHead(201);
            response.end("Works");
            break;
        }
        break;
      case "/auth/signup":
        request.on("data", (data: Buffer) => {
          console.log(data.toString());
        });
        response.writeHead(200, {
          "content-type": "text/html",
        });
        response.end(
          ejs.render(
            await htmlFileReader(path.join(__dirname, "Client", "Accounts.ejs"))
          )
        );
        break;
      case "/auth/login":
        request.on("data", (data: Buffer) => {
          console.log;
        });
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
                  }
                );
              response.writeHead(200);
              response.end(updatePage);
              break;
            case "delete":
              break;
            default:
              response.end("Not present");
              break;
          }
        }
    }
  }
);

server.listen(3000, () => {
  console.log("Server is up and running at port 3000");
});
