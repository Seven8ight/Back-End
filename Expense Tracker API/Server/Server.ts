import http, { IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import dotenv from "dotenv";
import path from "path";
import * as pg from "pg";
import { PostGresDB, userDetails } from "./Database/Postgres";

dotenv.config({ path: path.join(__dirname, ".env") });

const pgClient = new pg.Client({
    host: "localhost",
    port: 5432,
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: "expense_tracker",
  }),
  jsonResponse = (payload: string | any) =>
    JSON.stringify({ message: payload }),
  server: http.Server = http.createServer(
    async (
      request: http.IncomingMessage,
      response: ServerResponse<IncomingMessage>
    ) => {
      response.setHeader(
        "Access-Control-Allow-Origin",
        "http://localhost:5173"
      );
      response.setHeader(
        "Access-Control-Allow-Methods",
        "GET, PUT, POST, DELETE, PATCH, OPTIONS"
      );
      response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-type, authorization, accept"
      );

      if (request.method == "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }

      const requestUrl = URL.parse(
        `http://localhost:${process.env.PORT}${request.url}`
      );

      if (requestUrl) {
        const parsedPaths = requestUrl.pathname.split("/").filter(Boolean),
          DB = new PostGresDB(pgClient);

        switch (parsedPaths[0]) {
          case "accounts":
            switch (parsedPaths[1]) {
              case "register":
                let requestBody: any = "";

                request.on("data", (data: Buffer) => {
                  requestBody += data.toString();
                });

                request.on("end", async () => {
                  let userBody: userDetails = JSON.parse(requestBody),
                    createUser = await DB.createUser(userBody);

                  if (typeof createUser == "string") {
                    response.writeHead(409);
                    response.end(jsonResponse(createUser));
                  } else if (createUser instanceof Error) {
                    response.writeHead(500);
                    response.end(jsonResponse(createUser));
                  } else {
                    response.writeHead(201);
                    response.end(jsonResponse(createUser));
                  }
                });
                break;

              case "user":
                if (request.method == "GET") {
                  const parsedUserId = parsedPaths[2],
                    userRetrieval = await DB.getUser(parsedUserId);

                  if (!parsedUserId) {
                    response.writeHead(404);
                    response.end(
                      jsonResponse(
                        "Invalid user id, pass in a user id in the route parameter"
                      )
                    );
                  } else {
                    if (userRetrieval instanceof Error) {
                      response.writeHead(500);
                      response.end(jsonResponse(userRetrieval.message));
                    } else if (!userRetrieval) {
                      response.writeHead(200);
                      response.end(jsonResponse("User does not exist"));
                    } else {
                      response.writeHead(200);
                      response.end(jsonResponse(userRetrieval));
                    }
                  }
                } else {
                  response.writeHead(405);
                  response.end(
                    jsonResponse("Invalid route method, pass in a GET method")
                  );
                }

                break;

              case "update":
                if (request.method == "PATCH") {
                  const parsedUserId = parsedPaths[2];

                  if (!parsedUserId) {
                    response.writeHead(404);
                    response.end(
                      jsonResponse(
                        "Invalid user id, pass in a user id in the route parameter"
                      )
                    );
                  } else {
                    let userData: any = "";

                    request.on("data", (data: Buffer) => {
                      userData += data.toString();
                    });

                    request.on("end", async () => {
                      const newUserData: userDetails = JSON.parse(userData),
                        updateQuery = await DB.updateUser(
                          parsedUserId,
                          newUserData
                        );

                      if (updateQuery instanceof Error) {
                        response.writeHead(500);
                        response.end(jsonResponse(updateQuery.message));
                      } else {
                        switch (updateQuery) {
                          case "User does not exist":
                          case "User table doesn't exist":
                            response.writeHead(404);
                            response.end(jsonResponse("User does not exist"));
                            break;
                          case `Update successful`:
                            response.writeHead(201);
                            response.end(jsonResponse(updateQuery));
                            break;
                          default:
                            response.writeHead(409);
                            response.end(jsonResponse(updateQuery));
                            break;
                        }
                      }
                    });
                  }
                } else {
                  response.writeHead(405);
                  response.end(
                    jsonResponse(
                      "Invalid request method, pass in a patch method instead"
                    )
                  );
                }
                break;

              case "delete":
                if (request.method == "DELETE") {
                  const parsedUserId = parsedPaths[2];

                  try {
                    const deletionOperation = await DB.deleteUser(parsedUserId);

                    if (deletionOperation instanceof Error) {
                      response.writeHead(500);
                      response.end(jsonResponse(deletionOperation.message));
                    } else if (
                      deletionOperation == "User table doesn't exist"
                    ) {
                      response.writeHead(204);
                      response.end("User not present in the database");
                    } else {
                      response.writeHead(204);
                      response.end(deletionOperation);
                    }
                  } catch (error) {
                    response.writeHead(500);
                    response.end(jsonResponse("Server error try again"));
                  }
                } else {
                  response.writeHead(405);
                  response.end(
                    jsonResponse(
                      "Invalid route pass in a DELETE method instead"
                    )
                  );
                }
                break;

              default:
                response.writeHead(200);
                response.end(jsonResponse("Index route"));
            }
        }
      }
    }
  );

server.listen(process.env.PORT, async () => {
  await pgClient.connect();
  console.log("Server is running at port", process.env.PORT);
});
