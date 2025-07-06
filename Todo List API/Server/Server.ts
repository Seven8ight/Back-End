import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, ".env") });

import * as http from "http";
import pg from "pg";
import url from "url";
import { Database, UserDetails } from "./Database/Postgres";
import { verifyUser } from "./Authentication/Auth";

const port = process.env.PORT,
  postgres = new pg.Client({
    host: "localhost",
    database: "todolist",
    port: 5432,
    password: process.env.POSTGRES_PASS,
  }),
  jsonResponse = (message: string | any) =>
    JSON.stringify({ message: message }),
  server: http.Server = http.createServer(
    async (
      request: http.IncomingMessage,
      response: http.ServerResponse<http.IncomingMessage>
    ) => {
      const DB = new Database(postgres),
        Url = url.parse(request.url as string),
        parsedPaths = (Url.pathname as string).split("/").filter(Boolean);

      response.setHeader(
        "Access-Control-Allow-Origin",
        "http://localhost:5173"
      );
      response.setHeader(
        "Access-Control-Allow-Methods",
        "GET,PUT,POST,DELETE,OPTIONS"
      );
      response.setHeader(
        "Access-Control-Allow-Headers",
        "content-type, authorization, accept"
      );
      response.setHeader("Content-type", "application/json");

      switch (parsedPaths[0]) {
        case "accounts":
          switch (parsedPaths[1]) {
            case "register":
              let userInfo: any = "";

              if (request.method == "POST") {
                request.on("data", (userBuffer: Buffer) => {
                  userInfo += userBuffer.toString();
                });

                request.on("end", async () => {
                  try {
                    let userData: UserDetails = JSON.parse(userInfo);

                    if (
                      !userData.name ||
                      !userData.email ||
                      !userData.password
                    ) {
                      response.writeHead(409);
                      response.end(
                        jsonResponse(
                          "Incomplete credentials, provide name,email and password"
                        )
                      );

                      return;
                    }

                    let userCreation = await DB.registration(userData);

                    if (typeof userCreation == "string") {
                      if (userCreation.includes("duplicate")) {
                        response.writeHead(409);
                        response.end(
                          jsonResponse(
                            "Email already exists hence user already exists"
                          )
                        );
                        return;
                      }

                      response.writeHead(500);
                      response.end(
                        jsonResponse("Server error, please try again")
                      );
                      return;
                    }

                    response.writeHead(201);
                    response.end(JSON.stringify(userCreation));
                    return;
                  } catch (error) {
                    response.writeHead(500);
                    response.end(jsonResponse((error as Error).message));
                  }
                });
              } else {
                response.writeHead(405);
                response.end();
              }

              break;
            case "login":
              if (request.method == "POST") {
                let loginInfo: any = "";

                request.on("data", (loginData: Buffer) => {
                  loginInfo += loginData.toString();
                });

                request.on("end", async () => {
                  try {
                    let userData: UserDetails = JSON.parse(loginInfo);

                    if (!userData.email || !userData.password) {
                      response.writeHead(409);
                      response.end(
                        jsonResponse("Incomplete credentials, passed in login")
                      );
                      return;
                    }

                    let userLogin = await DB.login(userData);

                    switch (userLogin) {
                      case "User table non-existent":
                      case "User does not exist":
                        response.writeHead(200);
                        response.end(jsonResponse("User does not exist"));
                        break;
                      case "Incorrect password":
                        response.writeHead(403);
                        response.end(
                          jsonResponse(
                            "Incorrect password passed in for the account"
                          )
                        );
                        break;
                      default:
                        if (userLogin instanceof Error) {
                          response.writeHead(500);
                          response.end(
                            jsonResponse("Server error, try again please")
                          );
                          return;
                        }

                        response.writeHead(200);
                        response.end(JSON.stringify(userLogin));
                        return;
                    }
                  } catch (error) {
                    console.log(error);
                    response.writeHead(500);
                    response.end(
                      jsonResponse("Server error, please try again")
                    );
                    return;
                  }
                });
              } else {
                response.writeHead(405);
                response.end();
              }

              break;
            case "update":
              if (request.method == "PUT") {
                let userId = parsedPaths[1],
                  authId = request.headers["authorization"],
                  requestBody: any = "";

                if (!userId || !authId) {
                  response.writeHead(404);
                  response.end(
                    jsonResponse(
                      "Ensure to pass in user id in the url param and security key"
                    )
                  );
                  return;
                }

                const user = verifyUser(authId);

                if (typeof user == "boolean") {
                  response.writeHead(404);
                  response.end(jsonResponse("User token invalid"));
                  return;
                } else {
                  if ((user as any).id != userId) {
                    response.writeHead(403);
                    response.end(jsonResponse("User is invalid"));
                    return;
                  }

                  request.on("data", (data: Buffer) => {
                    requestBody += data.toString();
                  });

                  request.on("end", async () => {
                    try {
                      const updateDetails = JSON.parse(requestBody),
                        updateProcess = await DB.updateUser(
                          userId,
                          updateDetails
                        );

                      switch (updateProcess) {
                        case "User does not exist":
                          response.writeHead(404);
                          response.end(jsonResponse("User does not exist"));
                          break;
                        case true:
                          response.writeHead(201);
                          response.end(
                            jsonResponse("User updated successfully")
                          );
                          break;
                        default:
                          response.writeHead(409);
                          response.end(
                            jsonResponse("Invalid fields provided for updating")
                          );
                          break;
                      }
                    } catch (error) {
                      response.end(500);
                      response.end(
                        JSON.stringify({
                          message: "Server error, JSON parsing incorrect",
                        })
                      );
                    }
                  });
                }
              } else {
                response.writeHead(405);
                response.end(jsonResponse("Invalid method, try put next time"));
              }
              break;
            case "delete":
              if (request.method == "DELETE") {
                let userDId = parsedPaths[2],
                  authId = request.headers["authorization"];

                if (!userDId || !authId) {
                  response.writeHead(404);
                  response.end(
                    jsonResponse("User id and auth id must be provided")
                  );
                  return;
                }

                const user = verifyUser(authId);

                if (typeof user == "boolean") {
                  response.writeHead(404);
                  response.end(jsonResponse("User token invalid"));
                  return;
                } else {
                  if ((user as any).id != userDId) {
                    response.writeHead(403);
                    response.end(jsonResponse("User is invalid"));
                    return;
                  }

                  let deletionRequest = await DB.deleteUser(userDId);

                  switch (deletionRequest) {
                    case "User does not exist":
                      response.writeHead(404);
                      response.end(jsonResponse("User does not exist"));
                      break;
                    case true:
                      response.writeHead(204);
                      response.end();
                      break;
                    default:
                      response.writeHead(500);
                      response.end(
                        jsonResponse((deletionRequest as Error).message)
                      );
                      break;
                  }
                }
              } else {
                response.writeHead(405);
                response.end();
              }
              break;
            default:
              response.writeHead(404);
              response.end(
                jsonResponse(
                  "Route doesn't exist\n Existing routes are \n 1. register\n 2. login\n 3. Update\n 4. Delete"
                )
              );
              break;
          }
          break;
        case "todos":
          const userId = parsedPaths[2],
            authId = request.headers["authorization"];

          if (!userId || !authId) {
            response.writeHead(403);
            response.end(jsonResponse("User id and auth id should be present"));
            return;
          }

          const user = verifyUser(authId);

          if (typeof user == "boolean") {
            response.writeHead(404);
            response.end(jsonResponse("User token invalid"));
            return;
          } else if (typeof user == "string" && user.includes("jwt")) {
            response.writeHead(403);
            response.end(jsonResponse("Invalid jwt token parsed in" + user));
            return;
          } else if ((user as any).id != userId) {
            response.writeHead(403);
            response.end(jsonResponse("User is invalid"));
            return;
          }

          switch (parsedPaths[1]) {
            case "getall":
              const todos = await DB.getTodos(authId);

              if (typeof todos == "string") {
                response.writeHead(500);
                response.end(jsonResponse("Database error in reading data"));
                return;
              }

              response.writeHead(200);
              response.end(JSON.stringify(todos.rows));
              break;

            case "add":
              let todoData: any = "";

              request.on("data", (data: Buffer) => {
                todoData += data.toString();
              });

              request.on("end", () => {
                todoData = JSON.parse(todoData);

                if (!todoData.title || !todoData.description) {
                  response.writeHead(409);
                  response.end(
                    jsonResponse(
                      "Ensure to pass in the title and description of the todo item"
                    )
                  );
                  return;
                }

                const creation = DB.createTodo(authId, todoData);

                if (typeof creation == "string") {
                  if (creation == "Token passed is invalid") {
                    response.writeHead(403);
                    response.end(jsonResponse("User token is invalid"));
                  } else {
                    response.writeHead(409);
                    response.end(
                      jsonResponse(
                        "Ensure to pass in all details, userid, title and description"
                      )
                    );
                  }
                } else {
                  response.writeHead(201);
                  response.end(jsonResponse("Todo item created"));
                  return;
                }
              });

              break;

            case "update":
              console.log("Called here also");
              let updateData: any = "";

              request.on("data", (data: Buffer) => {
                updateData += data.toString();
              });

              request.on("end", async () => {
                updateData = JSON.parse(updateData);

                const updation = await DB.updateTodo(authId, updateData);

                if (typeof updation == "string") {
                  if (updation == "Token does not exist") {
                    response.writeHead(403);
                    response.end(jsonResponse("User token is invalid"));
                  } else if (updation == "Id should be provided") {
                    response.writeHead(403);
                    response.end(jsonResponse("todo id should be provided"));
                  } else {
                    response.writeHead(409);
                    response.end(
                      jsonResponse(
                        "Ensure to pass in all details, userid, title and description"
                      )
                    );
                  }
                } else {
                  response.writeHead(201);
                  response.end(jsonResponse("Todo item updated"));
                  return;
                }
              });
              break;

            case "delete":
              let deleteData: any = "";

              request.on("data", (data: Buffer) => {
                deleteData += data.toString();
              });

              request.on("end", async () => {
                deleteData = JSON.parse(deleteData);

                const deletion = await DB.deleteTodo({
                  token: authId,
                  todoId: deleteData.todoId,
                });

                if (typeof deletion == "string") {
                  switch (deletion) {
                    case "Token does not exist":
                      response.writeHead(403);
                      response.end(jsonResponse("User token is invalid"));
                      break;
                    case "Token passed is invalid":
                      response.writeHead(403);
                      response.end(jsonResponse("Parsed token is invalid"));
                      break;
                    case "Id should be provided":
                      response.writeHead(403);
                      response.end(jsonResponse("todo id should be provided"));
                      break;
                    case "Delete successful":
                      response.writeHead(204);
                      response.end();
                      break;
                    default:
                      response.writeHead(404);
                      response.end(
                        jsonResponse("The row does not exist in the database")
                      );
                      break;
                  }
                } else {
                  response.writeHead(500);
                  response.end(jsonResponse(deletion.message));
                  return;
                }
              });
              break;

            default:
              response.writeHead(404);
              return response.end(jsonResponse("Route does not exist"));
          }
          break;
        default:
          response.writeHead(200);
          response.end(jsonResponse("Server connection successful"));
          break;
      }
    }
  );

server.listen(port || 3000, async () => {
  await postgres.connect();
  process.stdout.write("Server is running at port 3000");
});

process.on("unhandledRejection", (error) => {
  console.log(error);
});
process.on("uncaughtException", (error) => {
  console.log(error);
});
