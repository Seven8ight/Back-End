import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, ".env") });

import * as http from "http";
import pg from "pg";
import url from "url";
import { Database, UserDetails } from "./Database/Postgres";
import { verifyUser, refreshToken } from "./Authentication/Auth";

const port = process.env.PORT,
  postgres = new pg.Client({
    host: "localhost",
    database: "todolist",
    port: 5432,
    password: process.env.POSTGRES_PASS,
  }),
  jsonResponse = (message: string | any) =>
    JSON.stringify({ message: message }),
  jsonParsing = async (content: string) =>
    new Promise((resolve, reject) => {
      try {
        resolve(JSON.parse(content));
      } catch (error) {
        reject(error);
      }
    }),
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
        "GET,PUT,POST,PATCH,DELETE,OPTIONS"
      );
      response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-type, authorization, accept"
      );
      response.setHeader("Content-type", "application/json");

      if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }

      switch (parsedPaths[0]) {
        case "accounts":
          switch (parsedPaths[1]) {
            case "profile":
              const authId = request.headers["authorization"];

              if (!authId) {
                response.writeHead(404);
                response.end(jsonResponse("Auth id is not present"));
              } else {
                let user = await DB.getUser(authId);

                if (typeof user == "string") {
                  if (user == "User table non-existent") {
                    response.writeHead(500);
                    response.end(
                      jsonResponse(
                        "Server error, please try again, table is non-existent on the server-side"
                      )
                    );
                  } else if (user == "User is non-existent") {
                    response.writeHead(404);
                    response.end(jsonResponse("User is non-existent"));
                  } else {
                    response.writeHead(500);
                    response.end(jsonResponse(user));
                  }
                } else {
                  delete user[0].password;

                  response.writeHead(200);
                  response.end(jsonResponse(user[0]));
                }
              }
              break;
            case "register":
              let userInfo: any = "";

              if (request.method == "POST") {
                request.on("data", (userBuffer: Buffer) => {
                  userInfo += userBuffer.toString();
                });
                console.log(userInfo);
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
                      case "User does not exist":
                        response.writeHead(200);
                        response.end(jsonResponse("User does not exist"));
                        break;
                      case "Incorrect password":
                        response.writeHead(403, "incorrrect password");
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
                let authId = request.headers["authorization"],
                  requestBody: any = "";

                if (!authId) {
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
                  request.on("data", (data: Buffer) => {
                    requestBody += data.toString();
                  });

                  request.on("end", async () => {
                    try {
                      const updateDetails = JSON.parse(requestBody),
                        updateProcess = await DB.updateUser(
                          (user as any).id,
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
            case "renew":
              if (request.method == "PATCH") {
                let refreshData: any = "";

                request.on("data", (data: Buffer) => {
                  refreshData += data.toString();
                });

                request.on("end", async () => {
                  let userRefreshToken = await jsonParsing(refreshData);

                  if (!(userRefreshToken instanceof Error)) {
                    try {
                      let refreshProcess = refreshToken(
                        (userRefreshToken as any).refreshToken
                      );

                      if (typeof refreshProcess == "string") {
                        response.writeHead(403);
                        response.end(jsonResponse("Refresh token is invalid"));
                        return;
                      }

                      response.writeHead(200);
                      response.end(jsonResponse(refreshProcess.accessToken));
                    } catch (error) {
                      if ((error as Error).message.includes("JSON")) {
                        response.writeHead(500);
                        response.end(
                          jsonResponse("JSON parsed is in invalid format")
                        );
                        return;
                      }

                      response.writeHead(500);
                      response.end(
                        jsonResponse(
                          "Server error, please try again" +
                            (error as Error).message
                        )
                      );
                    }
                  } else {
                    response.writeHead(409);
                    response.end(
                      jsonResponse("Json data passed in is invalid")
                    );
                  }
                });
              } else {
                response.writeHead(405);
                response.end(
                  jsonResponse("Invalid header method, use PATCH instead")
                );
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
          const authId = request.headers["authorization"];

          if (!authId) {
            response.writeHead(403);
            response.end(jsonResponse("Auth token should be present"));
            return;
          }

          switch (parsedPaths[1]) {
            case "getall":
              const todos = await DB.getTodos(authId);

              if (typeof todos == "string") {
                if (todos == "Token passed is invalid") {
                  response.writeHead(403);
                  response.end(jsonResponse("Token passed is invalid"));
                  return;
                }

                response.writeHead(500);
                response.end(jsonResponse("Database error in reading data"));
                return;
              }

              response.writeHead(200);
              response.end(JSON.stringify(todos.rows));
              break;
            case "get":
              if (request.method == "POST") {
                let requestBody: any = "";

                request.on("data", (data: Buffer) => {
                  requestBody += data.toString();
                });

                request.on("end", async () => {
                  try {
                    let todoData = await jsonParsing(requestBody);

                    const todoFinder = await DB.getTodo(
                      authId,
                      (todoData as any).id
                    );

                    if (todoFinder instanceof Error) {
                      response.writeHead(500);
                      response.end(
                        jsonResponse("Server error, please try again")
                      );
                      return;
                    } else if (typeof todoFinder == "string") {
                      response.writeHead(403);
                      response.end(
                        jsonResponse(
                          "User is invalid, token expired, try again"
                        )
                      );
                      return;
                    } else if (
                      todoFinder.rowCount &&
                      todoFinder.rowCount == 0
                    ) {
                      response.writeHead(404);
                      response.end(jsonResponse("Todo item not found"));
                    } else {
                      response.writeHead(200);
                      response.end(jsonResponse(todoFinder.rows[0]));
                    }
                  } catch (error) {
                    console.log(error);
                    response.writeHead(500);
                    response.end(
                      jsonResponse("Server error occured, please try again")
                    );
                  }
                });
              } else {
                response.writeHead(405);
                response.end(jsonResponse("POST method instead"));
              }
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
              if (request.method == "PUT") {
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
                      response.writeHead(404);
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
              } else {
                response.writeHead(405);
                response.end(
                  jsonResponse("Ensure to pass in a PUT method instead")
                );
              }
              break;
            case "delete":
              if (request.method == "DELETE") {
                let deleteTId: string = parsedPaths[2];

                const deletion = await DB.deleteTodo({
                  token: authId,
                  todoId: deleteTId,
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
                      console.log("Delete successful");
                      response.writeHead(204);
                      response.end(
                        jsonResponse("Todo item deleted successfully")
                      );
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
              } else {
                response.writeHead(405);
                response.end(jsonResponse("Use DELETE method instead"));
              }
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
