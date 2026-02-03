import type { IncomingMessage, ServerResponse } from "http";
import { UrlRepository } from "./Url.repository.js";
import { pgClient, redisClient } from "../../Config/Config.js";
import { UrlService } from "./Url.service.js";

export const UrlController = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
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
          if (!parsedRequestBody.shortCode)
            throw new Error("Short code not provided");

          const originalURL = await URLService.getOriginalURL(
            parsedRequestBody.shortCode,
          );

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
          if (!parsedRequestBody.shortCode)
            throw new Error("Short code not provided");

          const updateShortURL = await URLService.updateShortURL(
            parsedRequestBody.shortCode,
            { ...parsedRequestBody },
          );

          response.writeHead(200);
          response.end(JSON.stringify(updateShortURL));

          break;
        case "DELETE":
          if (!parsedRequestBody.shortCode)
            throw new Error("Short code not provided");

          const deleteShortURL = await URLService.deleteShortURL(
            parsedRequestBody.shortCode,
          );

          response.writeHead(204);
          response.end(deleteShortURL);
        default:
          response.writeHead(404);
          response.end(
            JSON.stringify({
              error: "Invalid response header sent",
            }),
          );
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
