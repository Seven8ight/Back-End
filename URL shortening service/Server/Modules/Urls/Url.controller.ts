import type { IncomingMessage, ServerResponse } from "http";
import { UrlRepository } from "./Url.repository.js";
import { pgClient, redisClient } from "../../Config/Config.js";
import { UrlService } from "./Url.service.js";

export const UrlController = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean),
    shortCode = pathNames[1];

  const URLRepo = new UrlRepository(pgClient, redisClient),
    URLService = new UrlService(URLRepo);

  let unparsedRequestBody: string = "";

  request.on(
    "data",
    (data: Buffer) => (unparsedRequestBody += data.toString()),
  );

  request.on("end", async () => {
    try {
      let parsedRequestBody = JSON.parse(unparsedRequestBody || "{}");

      switch (request.method) {
        case "GET":
          if (!shortCode) throw new Error("Short code not provided");

          const originalURL = await URLService.getOriginalURL(shortCode);

          response.writeHead(200);
          response.end(JSON.stringify(originalURL));

          break;
        case "POST":
          if (!parsedRequestBody.url) throw new Error("Url not provided");

          const newShortURL = await URLService.createShortURL(
            parsedRequestBody.url,
          );

          response.writeHead(201);
          response.end(JSON.stringify(newShortURL));

          break;
        case "PUT":
          if (!shortCode) throw new Error("Short code not provided");

          const updateShortURL = await URLService.updateShortURL(shortCode, {
            ...parsedRequestBody,
          });

          response.writeHead(200);
          response.end(JSON.stringify(updateShortURL));

          break;
        case "DELETE":
          if (!shortCode) throw new Error("Short code not provided");

          const deleteShortURL = await URLService.deleteShortURL(shortCode);

          response.writeHead(204);
          response.end(deleteShortURL);

          break;
        default:
          response.writeHead(404);
          response.end(
            JSON.stringify({
              error: "Invalid response header sent",
            }),
          );

          break;
      }
    } catch (error) {
      response.writeHead(400);
      response.end(
        JSON.stringify({
          error: (error as Error).message,
        }),
      );
    }
  });
};
