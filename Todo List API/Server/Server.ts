import * as http from "http";
import pg from "pg";
import { Database, UserDetails } from "./Database/Postgres";

const postgres = new pg.Client({
    host: "localhost",
    database: "todolist",
    port: 5432,
    password: process.env.POSTGRES_PASS,
  }),
  jsonResponse = (message: string) => JSON.stringify({ message: message }),
  server: http.Server = http.createServer(
    (
      request: http.IncomingMessage,
      response: http.ServerResponse<http.IncomingMessage>
    ) => {
      const DB = new Database(postgres),
        url = URL.parse(request.url as string),
        parsedPaths = (url as URL).pathname.split("/");

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
              let userInfo: any;

              request.on("data", (userBuffer: Buffer) => {
                userInfo += userBuffer.toString();
              });

              request.on("end", async () => {
                try {
                  let userData: UserDetails = JSON.parse(userInfo);

                  if (!userData.name || !userData.email || !userData.password) {
                    response.writeHead(409);
                    response.end(
                      JSON.stringify({
                        message: "Incomplete credentials",
                      })
                    );
                    return;
                  }

                  let userCreation = await DB.registration(userData);

                  if (typeof userCreation == "string") {
                    response.writeHead(500);
                    response.end(
                      JSON.stringify({
                        message: "Server error, please try again",
                      })
                    );
                    return;
                  }

                  response.writeHead(201);
                  response.end(JSON.stringify(userCreation));
                  return;
                } catch (error) {
                  response.end(
                    JSON.stringify({
                      message: "Server error",
                    })
                  );
                }
              });

              break;
            case "login":
              let loginInfo: any;

              request.on("data", (loginData: Buffer) => {
                loginInfo += loginData.toString();
              });

              request.on("end", async () => {
                try {
                  let userData: UserDetails = JSON.parse(userInfo);

                  if (!userData.email || !userData.password) {
                    response.writeHead(409);
                    response.end(jsonResponse("Incomplete credentials"));
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
                  response.writeHead(500);
                  response.end(jsonResponse("Incomplete credentials"));
                  return;
                }
              });

              break;
            default:
              response.writeHead(404);
              response.end(
                jsonResponse(
                  "Route doesn't exist\n Existing routes are \n 1. register\n 2. login"
                )
              );
              break;
          }
          break;
        case "todos":
          switch (parsedPaths[1]) {
            case "get":
              break;
            case "add":
              break;
            case "update":
              break;
            case "delete":
              break;
            default:
              break;
          }
          break;
        default:
          response.writeHead(200);
          response.end(jsonResponse("Server connection successful"));
          break;
      }
    }
  );

server.listen(3000, () => {
  console.log("Server is running at port 3000");
});
