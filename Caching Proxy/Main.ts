#!/usr/bin/env node

import * as http from "http";
import * as https from "https";
import {
  type Server,
  type IncomingMessage,
  type ServerResponse,
  type ClientRequest,
} from "http";
import { URL } from "url";
import { CacheDB } from "./Cache/Cache";

const args: string[] = process.argv.slice(2),
  Cachedb = new CacheDB();

let options: Record<string, string> = {};

args.forEach((arg, index, arr) => {
  if (!arg.includes("clear-cache")) {
    if (arg.includes("--") && !arr[index + 1].includes("--"))
      options[arg.replace(/-+/g, "")] = arr[index + 1];
  } else options["clear_cache"] = "yes";
});

if (options.port && options.origin) {
  const server: Server = http.createServer(
    async (
      request: IncomingMessage,
      response: ServerResponse<IncomingMessage>
    ) => {
      if (request.url) {
        const requestUrl = new URL(
            request.url!,
            `http://${request.headers.host}`
          ),
          requestParams = requestUrl?.pathname,
          params = requestParams && requestParams.split("/").filter(Boolean);

        if (Array.isArray(params)) {
          if (params.length > 0) {
            const urlOptions = {
              headers: {
                accept: "application/json",
              },
            };

            let networkRequest: ClientRequest,
              url = `${options.origin}/${params.join("/")}`,
              cacheHit = await Cachedb.retrieveResponse(url);

            if (cacheHit == null) {
              if (options.origin.includes("https")) {
                networkRequest = https.request(
                  url,
                  urlOptions,
                  (res: IncomingMessage) => {
                    let responseData: any = "";

                    res.on("error", (error: Error) => {
                      response.writeHead(500);
                      response.end(
                        JSON.stringify({
                          Error: `Request incomplete, ${error.message}`,
                        })
                      );
                    });

                    res.on("data", (data) => (responseData += data));

                    res.on("end", async () => {
                      try {
                        let jsonResponseData = JSON.parse(responseData);

                        let cacheSave = await Cachedb.cacheResponse(
                          url,
                          res.headers,
                          jsonResponseData
                        );

                        response.writeHead(200);
                        response.end(
                          JSON.stringify({
                            FromCache: false,
                            SavedInCache: cacheSave ? true : false,
                            ...jsonResponseData,
                          })
                        );
                      } catch (error) {
                        response.writeHead(500);
                        response.end(
                          JSON.stringify({
                            Error: (error as Error).message,
                          })
                        );
                      }
                    });
                  }
                );
              } else {
                networkRequest = http.request(
                  url,
                  urlOptions,
                  (res: IncomingMessage) => {
                    let responseData: any = "";

                    res.on("error", (error: Error) => {
                      response.writeHead(500);
                      response.end(
                        JSON.stringify({
                          Error: `Request incomplete, ${error.message}`,
                        })
                      );
                    });

                    res.on("data", (data) => (responseData += data));

                    res.on("end", async () => {
                      try {
                        let jsonResponseData = JSON.parse(responseData);

                        let cacheSave = await Cachedb.cacheResponse(
                          url,
                          res.headers,
                          jsonResponseData
                        );

                        response.writeHead(200);
                        response.end(
                          JSON.stringify({
                            FromCache: false,
                            SavedInCache: cacheSave ? true : false,
                            ...jsonResponseData,
                          })
                        );
                      } catch (error) {
                        response.writeHead(500);
                        response.end(
                          JSON.stringify({
                            Error: (error as Error).message,
                          })
                        );
                      }
                    });
                  }
                );
              }

              networkRequest.on("error", (error: Error) =>
                process.stdout.write(
                  `Error occured on request: ${error.message}`
                )
              );

              networkRequest.end();
            } else {
              response.writeHead(200);
              response.end(
                JSON.stringify({ FromCache: true, ...cacheHit.Result })
              );
            }
          } else {
            response.writeHead(200);
            response.end(
              JSON.stringify(`Cache server listening at port ${options.port}`)
            );
          }
        } else {
          response.writeHead(409);
          response.end(
            JSON.stringify({
              Error: "Invalid route parameters passed in\n",
            })
          );
        }
      } else {
        response.writeHead(500);
        response.end(
          JSON.stringify({
            Error: "Request url invalid, server error, kindly try again\n",
          })
        );
      }
    }
  );

  server.listen(options.port, () =>
    process.stdout.write(`Server started at port: ${options.port}`)
  );
} else if (options.clear_cache)
  (async () => {
    let clear = await Cachedb.clearCache();

    if (clear) process.stdout.write("Cache cleared\n");
    else process.stdout.write(`Error occured in clearing cache\n`);
  })();
else
  process.stdout.write(
    "Please ensure to provide a port number and origin url for forwarding requests to or pass in --clear-cache true to clear the cache file"
  );
