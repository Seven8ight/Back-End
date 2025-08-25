import http, { IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import dotenv from "dotenv";
import path from "path";
import * as pg from "pg";
import * as redis from "redis";
import { expense, UserDB, ExpenseDB, userDetails } from "./Database/Postgres";
import { CacheDB } from "./Cache/Cache";
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTGF3cmVuY2UgTXVjaGlyaSIsImVtYWlsIjoibGx3bXVjaGlyaUBnbWFpbC5jb20iLCJwYXNzd29yZCI6ImRhdmlkd2FuMSoiLCJpZCI6Ijc2MGY4OTk0LTk2MzEtNDdmOS1hZGM1LWJjMWQ1MjJiZjI5ZCIsImlhdCI6MTc1NTc4NzU4MX0.t5kagBrd1QZIrcQQoHY_MimfcIZ-LpV7vOBbKKBvZHc
dotenv.config({ path: path.join(__dirname, ".env") });

export const pgClient = new pg.Client({
    host: "localhost",
    port: 5432,
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: "expense_tracker",
  }),
  redisClient = redis.createClient({
    socket:{
      host:'localhost',
      port:6379
    }
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
          cacheDB = new CacheDB(redisClient);

        switch (parsedPaths[0]) {
          case "accounts":
            const UserDb = new UserDB(pgClient)

            if(parsedPaths[1] != 'register' && parsedPaths[1] != 'login'){
              const authId = request.headers['authorization']

              if(!authId){
                response.writeHead(401)
                response.end(jsonResponse("Incomplete user credentials, provide the valid header"))
                return
              }

              UserDb.userToken = authId
            }
            
            switch (parsedPaths[1]) {
              case "register":
                let requestBody: any = "";

                request.on("data", (data: Buffer) => {
                  requestBody += data.toString();
                });

                request.on("end", async () => {
                  let userBody: userDetails = JSON.parse(requestBody),
                    createUser = await UserDb.createUser(userBody)
                  
                  if (typeof createUser == "string") {
                    if(createUser.includes("duplicate key")){
                      response.writeHead(409)
                      response.end(jsonResponse("User already exists"))
                      return
                    }

                    response.writeHead(409);
                    response.end(jsonResponse(createUser));
                  } else {
                    response.writeHead(201);
                    response.end(jsonResponse(createUser));
                  }
                });
                break;
              case "login":
                if(request.method != 'POST'){
                  response.writeHead(405)
                  response.end(jsonResponse("Invalid HTTP method, use POST instead"))
                }

                let requestLoginBody:any = "";

                request.on('data',(data:Buffer) => {
                  requestLoginBody += data.toString()
                })

                request.on('end',async () => {
                  let userBody:Omit<userDetails,"name"> = JSON.parse(requestLoginBody),
                    loginRequest = await UserDb.loginUser(userBody)

                  if(typeof loginRequest == 'string'){
                    if(loginRequest.includes("exist")){
                      response.writeHead(404)
                      response.end(jsonResponse("User not found"))
                    }
                    else{
                      response.writeHead(500)
                      response.end(jsonResponse(loginRequest))
                    }
                  }
                  else{
                    response.writeHead(200)
                    response.end(jsonResponse(loginRequest))
                  }
                })

                break
              case "user":
                if (request.method == "GET") { 
                  const userRetrieval = await UserDb.getUser()
                  
                  switch(typeof userRetrieval){
                    case 'string':
                      switch(userRetrieval){
                        case "User doesn't exist":
                          response.writeHead(404)
                          response.end(jsonResponse(userRetrieval))
                          break
                        case "User table not created":
                          response.writeHead(404)
                          response.end(jsonResponse(userRetrieval))
                          break
                        case "User not validated":
                          response.writeHead(403)
                          response.end(jsonResponse("User authentication failed"))
                          break
                        default:
                          response.writeHead(500)
                          response.end(jsonResponse(`Server error, ${userRetrieval}`))
                          break
                      }
                      break
                    default:
                      response.writeHead(200)
                      response.end(jsonResponse(userRetrieval))
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
                  let userData: any = "";

                  request.on("data", (data: Buffer) => {
                    userData += data.toString();
                  });

                  request.on("end", async () => {
                    const newUserData: userDetails = JSON.parse(userData);
                    
                    const updateQuery = await UserDb.updateUser(newUserData);
                      
                    switch (updateQuery) {
                      case "Authentication failed":
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
                  );
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
                  try {
                    const deletionOperation = await UserDb.deleteUser();

                    switch(deletionOperation){
                      case "User deleted successfully":
                        response.writeHead(204)
                        response.end(jsonResponse("User deletion successful"))
                        break
                      case "Authentication failed":
                        response.writeHead(403)
                        response.end(jsonResponse("Re-login again"))
                        break
                      case "User id absent":
                        response.writeHead(401)
                        response.end(jsonResponse("Provide authentication credentials"))
                        break
                      default:
                        response.writeHead(500)
                        response.end(jsonResponse(`Server error ${deletionOperation}`))
                        break
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
                response.end(jsonResponse("Index route for accounts route"));
            }
            break;
          case "expenses":
            const userToken = request.headers['authorization']

            if(!userToken){
              response.writeHead(401)
              response.end(jsonResponse("Provide authentication in the header"))
              return
            }

            const ExpenseDb = new ExpenseDB(pgClient,userToken)

            switch (parsedPaths[1]) {
              case "get":
                if (request.method == "GET") {
                  const expenseId = parsedPaths[2],
                    expenseInCache = await cacheDB.getExpense(expenseId);
                  if (
                    typeof expenseInCache == "string" ||
                    expenseInCache instanceof Error
                  ) {
                    const expenseRetrieval = await ExpenseDb.getExpense(expenseId);

                    if (expenseRetrieval == "No such expense found") {
                      response.writeHead(404);
                      response.end(jsonResponse("Expense not found"));
                    } else {
                      await cacheDB.saveExpense(
                        expenseId,
                        expenseRetrieval as expense
                      );
                      response.writeHead(200);
                      response.end(jsonResponse(expenseRetrieval));
                    }
                  } else {
                    response.writeHead(200);
                    response.end(jsonResponse(expenseInCache));
                  }
                } else {
                  response.writeHead(405);
                  response.end(jsonResponse("Pass in a GET Method instead"));
                }
                break;
              case "getall":
                if (request.method == "GET") {
                  const user = await ExpenseDb.getUser()

                  if(typeof user != 'string'){
                    const expensesInCache = await cacheDB.getExpenses((user as any).id);
                  
                    if (expensesInCache instanceof Error || (typeof expensesInCache == 'string' && expensesInCache.toLowerCase().includes("empty"))) {
                      const expenseRetrieval = await ExpenseDb.getExpenses();

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
                          (user as any).id,
                          expenseRetrieval
                      ) ;
                      }
                    } else if (typeof expensesInCache == "string") {
                      response.writeHead(200);
                      response.end(jsonResponse(JSON.parse(expensesInCache)));
                    }
                  }
                  else{
                    response.writeHead(500)
                    response.end(jsonResponse("Server error in reading user, Re-login"))
                  }
                }
                else {
                  response.writeHead(405);
                  response.end(jsonResponse("Pass in a GET Method instead"));
                }
                break;
              case "add":
                if (request.method == "POST") {
                  let requestBody: any = "";

                  request.on("data", (data: Buffer) => {
                    requestBody += data.toString();
                  });

                  request.on("end", async () => {
                    let expenseData:expense = JSON.parse(requestBody),
                      additionOperation = await ExpenseDb.createExpense(expenseData);

                    switch(additionOperation){
                      case "Expense created successfully":
                        response.writeHead(201);
                        response.end(jsonResponse("Expense created successfully"));
                        break;
                      case "Incomplete details, ensure to provide title,description, category, amount, createdAt and updatedAt fields":
                        response.writeHead(409);
                        response.end(jsonResponse(additionOperation))
                        break
                      default:
                        if(additionOperation.includes("User object")){
                          response.writeHead(403);
                          response.end(jsonResponse("Reauthenticate yourself"))
                        }
                        else if(additionOperation.includes("Database")){
                          response.writeHead(500)
                          response.end(jsonResponse("Server error, please try again later, Error: " + additionOperation));
                        }
                        else{
                          response.writeHead(409)
                          response.end(jsonResponse(additionOperation))
                        }
                    }
                  });
                } else {
                  response.writeHead(405);
                  response.end(jsonResponse("Ensure to pass in a post method"));
                }
                break;
              case "update":
                if (request.method == "PATCH") {
                  const expenseId = parsedPaths[2];

                  if (!expenseId) {
                    response.writeHead(401);
                    response.end(
                      jsonResponse(
                        "Ensure to provide an expense id for updating"
                      )
                    );
                    return;
                  }

                  let newData: string = "";

                  request.on("data", (data: Buffer) => {
                    newData += data.toString();
                  });

                  request.on("end", async () => {
                    let updateData = JSON.parse(newData),
                      updationOperation = await ExpenseDb.updateExpense(
                        expenseId,
                        updateData
                      );
                    switch(updationOperation){
                      case "Update successful":
                        try{
                          await cacheDB.expireImmediate("expenses");
                          await cacheDB.expireImmediate(`${expenseId}`);
                        }
                        catch(error){
                          console.log(error)
                        }
                        response.writeHead(201)
                        response.end(jsonResponse(updationOperation))
                        break
                      case "Expense table not created":
                        response.writeHead(500)
                        response.end(jsonResponse(updationOperation))
                        break
                      default:
                        if(updationOperation.toLowerCase().includes("error")){
                          response.writeHead(500)
                          response.end(jsonResponse(updationOperation))
                        }
                        else{
                          response.writeHead(404)
                          response.end(jsonResponse(updationOperation))
                        }
                        break
                    }
                  }); 
                } else {
                  response.writeHead(405);
                  response.end(
                    jsonResponse("Ensure to pass in a PATCH method")
                  );
                }
                break;
              case "delete":
                if (request.method == "DELETE") {
                  const expenseId = parsedPaths[2];

                  if (!expenseId || expenseId.length <= 0) {
                        response.writeHead(409);
                        response.end(
                          jsonResponse(
                            "Please provide the expense id on the route"
                          )
                        );
                  } else {
                    const deletionOperation = await ExpenseDb.deleteExpense(
                      expenseId
                    );

                    switch(deletionOperation){
                      case "Expense deleted":
                        await cacheDB.expireImmediate("expenses");
                        await cacheDB.expireImmediate(`${expenseId}`);
                        response.writeHead(204)
                        response.end(jsonResponse("Expense deleted"))
                        break
                      case "Authentication failed":
                        response.writeHead(403)
                        response.end(jsonResponse("Authentication failed"))
                        break
                      default:
                        response.writeHead(500);
                        response.end(jsonResponse("Server error: " + deletionOperation))
                        break
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
      else{
        response.writeHead(500)
        response.end(jsonResponse("Request URL invalid try again"))
      }
    }
  );

server.listen(process.env.PORT, async () => {
  Promise.all([await pgClient.connect(), await redisClient.connect()])
    .then(() => console.log("Database and Redis are up and running"))
    .catch(() => console.log("Failure to connect to redis cache"));

  console.log("Server is running at port", process.env.PORT);
});
