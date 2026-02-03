import http, { IncomingMessage, ServerResponse } from "http";
import { UrlRepository } from "./Modules/Urls/Url.repository.js";
import { pgClient, redisClient } from "./Config/Config.js";
import { UrlService } from "./Modules/Urls/Url.service.js";
import { UrlController } from "./Modules/Urls/Url.controller.js";

const urlRepo = new UrlRepository(pgClient, redisClient),
  urlService = new UrlService(urlRepo);

export const Router = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean);

  if (pathNames[0] == "shorten") UrlController(request, response);
  else {
    const originalUrl = await urlService.getOriginalURL(pathNames[0]!);

    response.writeHead(301, {
      location: `${originalUrl}`,
    });
    response.end();
  }
};
