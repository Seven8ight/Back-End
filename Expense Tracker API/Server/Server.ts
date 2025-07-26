import http, { IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import dotenv from "dotenv";
import path from "path";
import * as pg from "pg";
import * as redis from "redis";
import { expense, PostGresDB, userDetails } from "./Database/Postgres";
import { CacheDB } from "./Cache/Cache";
import { verifyAccessToken } from "./Authentication/Auth";

dotenv.config({ path: path.join(__dirname, ".env") });

export const pgClient = new pg.Client({
    host: "localhost",
    port: 5432,
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: "expense_tracker",
  }),
  redisClient = redis.createClient(),
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
          DB = new PostGresDB(pgClient),
          cacheDB = new CacheDB(redisClient);

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
                    authId = request.headers["authorization"];

                  if (!parsedUserId || !authId) {
                    response.writeHead(404);
                    response.end(
                      jsonResponse(
                        "Invalid user id, pass in a user id in the route parameter, ensure to pass in an auth id in the headers section"
                      )
                    );
                  } else {
                    const userObject = verifyAccessToken(authId),
                      userRetrieval = await DB.getUser(parsedUserId);

                    if (userObject instanceof Error) {
                      response.writeHead(403);
                      response.end(
                        jsonResponse("Auth id is invalid try again")
                      );
                    } else {
                      if (userRetrieval instanceof Error) {
                        response.writeHead(500);
                        response.end(jsonResponse(userRetrieval.message));
                      } else if (typeof userRetrieval == "string") {
                        response.writeHead(200);
                        response.end(jsonResponse("User does not exist"));
                      } else {
                        if (
                          (userObject as any).id == (userRetrieval as any).id
                        ) {
                          response.writeHead(403);
                          response.end(
                            jsonResponse(
                              "Invalid user authentication, auth id doesnt match the user"
                            )
                          );
                        } else {
                          response.writeHead(200);
                          response.end(jsonResponse(userRetrieval));
                        }
                      }
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
                  const parsedUserId = parsedPaths[2],
                    authId = request.headers["authorization"];

                  if (!parsedUserId || !authId) {
                    response.writeHead(404);
                    response.end(
                      jsonResponse(
                        "Invalid user id or auth id, pass in a user id in the route parameter and auth id in the headers section"
                      )
                    );
                  } else {
                    const userObject = verifyAccessToken(authId);

                    if (userObject instanceof Error) {
                      response.writeHead(403);
                      response.end(
                        jsonResponse(
                          "Token passed in is invalid, try again in authentication, logging in"
                        )
                      );
                    } else {
                      let userData: any = "";

                      request.on("data", (data: Buffer) => {
                        userData += data.toString();
                      });

                      request.on("end", async () => {
                        const newUserData: userDetails = JSON.parse(userData);

                        if ((userObject as any).id == (newUserData as any).id) {
                          const updateQuery = await DB.updateUser(
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
                                response.end(
                                  jsonResponse("User does not exist")
                                );
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
                        } else {
                          response.writeHead(403);
                          response.end(
                            jsonResponse(
                              "User does not match, authentication details"
                            )
                          );
                        }
                      });
                    }
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
                  const parsedUserId = parsedPaths[2],
                    authId = request.headers["authorization"];

                  if (!parsedUserId || !authId) {
                    response.writeHead(401);
                    response.end(
                      jsonResponse(
                        "Ensure to pass in the user id and auth id in their respective locations."
                      )
                    );
                  } else {
                    const userObject = verifyAccessToken(authId);

                    if (userObject instanceof Error) {
                      response.writeHead(403);
                      response.end(
                        jsonResponse(
                          "Token passed has expired, reauthenticate please"
                        )
                      );
                    } else if ((userObject as any).id != parsedUserId) {
                      response.writeHead(403);
                      response.end(
                        jsonResponse(
                          "User id's from authentication and request do not match, reauthenticate please"
                        )
                      );
                    } else {
                      try {
                        const deletionOperation = await DB.deleteUser(
                          parsedUserId
                        );

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
                    }
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
                response.end(jsonResponse("Index route for accounts route"));
            }
            break;
          case "expenses":
            switch (parsedPaths[1]) {
              case "get":
                if (request.method == "GET") {
                  const authId = request.headers["authorization"];

                  if (authId) {
                    const userObject = verifyAccessToken(authId);

                    if (userObject instanceof Error) {
                      response.writeHead(403);
                      response.end(
                        jsonResponse(
                          "Token, passed in has either expired or is invalid"
                        )
                      );
                    } else {
                      const expenseId = parsedPaths[2],
                        expenseInCache = await cacheDB.getExpense(expenseId);

                      if (
                        typeof expenseInCache == "string" ||
                        expenseInCache instanceof Error
                      ) {
                        const expenseRetrieval = await DB.getExpense(
                          (userObject as any).id,
                          expenseId
                        );

                        await cacheDB.saveExpense(
                          expenseId,
                          expenseRetrieval as expense
                        );

                        if (expenseRetrieval == "Not found") {
                          response.writeHead(404);
                          response.end(jsonResponse("Expense not found"));
                        } else {
                          response.writeHead(200);
                          response.end(jsonResponse(expenseRetrieval));
                        }
                      } else {
                        response.writeHead(200);
                        response.end(jsonResponse(expenseInCache));
                      }
                    }
                  } else {
                    response.writeHead(401);
                    response.end(
                      jsonResponse("Pass in an auth token to proceed")
                    );
                  }
                } else {
                  response.writeHead(405);
                  response.end(jsonResponse("Pass in a GET Method instead"));
                }
                break;

              case "getall":
                if (request.method == "GET") {
                  const authId = request.headers["authorization"];

                  if (authId) {
                    const userObject = verifyAccessToken(authId);

                    if (userObject instanceof Error) {
                      response.writeHead(403);
                      response.end(
                        jsonResponse(
                          "Token, passed in has either expired or is invalid"
                        )
                      );
                    } else {
                      const expensesInCache = await cacheDB.getExpenses(
                        (userObject as any).id
                      );

                      if (expensesInCache instanceof Error) {
                        const expenseRetrieval = await DB.getExpenses(
                          (userObject as any).id
                        );

                        if (expenseRetrieval instanceof Error) {
                          response.writeHead(500);
                          response.end(
                            jsonResponse(
                              "Server error in fetching expenses, please try again"
                            )
                          );
                        } else if (typeof expenseRetrieval == "string") {
                          response.writeHead(200);
                          response.end(jsonResponse("No expenses found"));
                        } else {
                          response.writeHead(200);
                          response.end(jsonResponse(expenseRetrieval));

                          await cacheDB.saveExpenses(
                            (userObject as any).id,
                            expenseRetrieval
                          );
                        }
                      } else if (typeof expensesInCache == "string") {
                        response.writeHead(200);
                        response.end(jsonResponse(JSON.parse(expensesInCache)));
                      }
                    }
                  } else {
                    response.writeHead(401);
                    response.end(
                      jsonResponse("Pass in an auth token to proceed")
                    );
                  }
                } else {
                  response.writeHead(405);
                  response.end(jsonResponse("Pass in a GET Method instead"));
                }
                break;

              case "add":
                if (request.method == "POST") {
                  const authId = request.headers["authorization"];

                  if (!authId) {
                    response.writeHead(401);
                    response.end(
                      jsonResponse(
                        "Esnure to provide an authentication Id in your requests"
                      )
                    );
                    return;
                  }

                  const userObject = verifyAccessToken(authId);

                  if (userObject instanceof Error) {
                    response.writeHead(403);
                    response.end(
                      jsonResponse(
                        "Auth id has expired, please authenticate again"
                      )
                    );
                  } else {
                    let requestBody: any = "";

                    request.on("data", (data: Buffer) => {
                      requestBody += data.toString();
                    });

                    request.on("end", async () => {
                      let expenseData = JSON.parse(requestBody),
                        additionOperation = await DB.createExpense(
                          (userObject as any).id,
                          expenseData
                        );

                      if (additionOperation instanceof Error) {
                        response.writeHead(500);
                        response.end(
                          jsonResponse(
                            "Error in adding expense, try again please"
                          )
                        );
                      } else {
                        switch (additionOperation) {
                          case "Expense created":
                            response.writeHead(201);
                            response.end(jsonResponse("Expense created"));

                            await cacheDB.expireImmediate("expenses");
                            break;
                          case "Ensure to provide a value in all fields":
                            response.writeHead(409);
                            response.end(
                              jsonResponse(
                                "Incomplete values, ensure all values are present"
                              )
                            );
                          default:
                            response.writeHead(409);
                            response.end(jsonResponse(additionOperation));
                        }
                      }
                    });
                  }
                } else {
                  response.writeHead(405);
                  response.end(jsonResponse("Ensure to pass in a post method"));
                }
                break;

              case "update":
                if (request.method == "PATCH") {
                  const authId = request.headers["authorization"],
                    expenseId = parsedPaths[2];

                  if (!authId || !expenseId) {
                    response.writeHead(401);
                    response.end(
                      jsonResponse(
                        "Esnure to provide an authentication Id in your requests and expense id for updating"
                      )
                    );
                    return;
                  }

                  const userObject = verifyAccessToken(authId);

                  if (userObject instanceof Error) {
                    response.writeHead(403);
                    response.end(
                      jsonResponse(
                        "Auth id has expired, please authenticate again"
                      )
                    );
                  } else {
                    let newData: string = "";

                    request.on("data", (data: Buffer) => {
                      newData += data.toString();
                    });

                    request.on("end", async () => {
                      let updateData = JSON.parse(newData),
                        updationOperation = await DB.updateExpense(
                          (userObject as any).id,
                          expenseId,
                          updateData
                        );

                      if (updationOperation instanceof Error) {
                        response.writeHead(500);
                        response.end(
                          jsonResponse(
                            "Server error in updating the expense, please try again"
                          )
                        );
                      } else {
                        switch (updationOperation) {
                          case "Update successful":
                            response.writeHead(202);
                            response.end(jsonResponse("Update successful"));

                            await cacheDB.expireImmediate("expenses");
                            await cacheDB.expireImmediate(`${expenseId}`);
                            break;
                          case "Expense not found":
                            response.writeHead(404);
                            response.end(jsonResponse("Expense not found"));
                            break;
                          case "Amount should have a valid integer inside and should be greater than 0":
                          default:
                            response.writeHead(409);
                            response.end(
                              "Amount and all other fields should have definite and valid data types as input"
                            );
                            break;
                        }
                      }
                    });
                  }
                } else {
                  response.writeHead(405);
                  response.end(
                    jsonResponse("Ensure to pass in a PATCH method")
                  );
                }
                break;

              case "delete":
                if (request.method == "DELETE") {
                  const authId = request.headers["authorization"];

                  if (!authId) {
                    response.writeHead(401);
                    response.end(
                      jsonResponse(
                        "Authentication id not provided, authenticate yourself first"
                      )
                    );
                  } else {
                    const userObject = verifyAccessToken(authId);

                    if (userObject instanceof Error) {
                      response.writeHead(403);
                      response.end(
                        jsonResponse(
                          "Auth id has expired, authenticate yourself at login"
                        )
                      );
                    } else {
                      const expenseId = parsedPaths[2];

                      if (!expenseId || expenseId.length <= 0) {
                        response.writeHead(409);
                        response.end(
                          jsonResponse(
                            "Please provide the expense id on the route"
                          )
                        );
                      } else {
                        const deletionOperation = await DB.deleteExpense(
                          (userObject as any).id,
                          expenseId
                        );

                        if (deletionOperation instanceof Error) {
                          response.writeHead(500);
                          response.end(
                            jsonResponse("Error in deletion, please try again")
                          );
                        } else {
                          switch (deletionOperation) {
                            case "Successful deletion":
                              response.writeHead(204);
                              response.end(
                                jsonResponse("Expense deleted successfully")
                              );

                              await cacheDB.expireImmediate("expenses");
                              await cacheDB.expireImmediate(`${expenseId}`);
                              break;
                            case "User does not exist":
                              response.writeHead(404);
                              response.end(
                                jsonResponse(
                                  "User doesn't exist with such expense"
                                )
                              );
                              break;
                            case "Expense does not exist":
                              response.writeHead(404);
                              response.end(
                                jsonResponse(
                                  "The selected expense does not exist"
                                )
                              );
                              break;
                          }
                        }
                      }
                    }
                  }
                } else {
                  response.writeHead(405);
                  response.end(
                    jsonResponse("Invalid http method, try DELETE next time")
                  );
                }
                break;

              default:
                response.writeHead(200);
                response.end(jsonResponse("Index route for /expenses"));
                break;
            }
            break;
          default:
            response.writeHead(200);
            response.end(
              jsonResponse("Index route for express tracker server api")
            );
        }
      }
    }
  );

server.listen(process.env.PORT, async () => {
  Promise.all([await pgClient.connect(), await redisClient.connect()])
    .then(() => console.log("Database and Redis are up and running"))
    .catch(() => console.log("Failure to connect to redis cache"));

  console.log("Server is running at port", process.env.PORT);
});
