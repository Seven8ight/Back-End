import * as http from "http";
import * as dotenv from "dotenv";
import * as redis from "redis";
import path from "path";
import fs from "fs/promises";
import url from "url";

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const portNumber = process.env.PORT,
  mimetypes = {
    html: "text/html",
    css: "text/css",
    js: "application/js",
    png: "image/png",
  },
  redisClient = redis.createClient(),
  weatherPageRenderer = async (file: string): Promise<any> =>
    await fs.readFile(path.resolve(__dirname, "../", "Client", file), {
      encoding: "utf-8",
    }),
  imageRenderer = async (file: string): Promise<any> =>
    await fs.readFile(path.resolve(__dirname, "../", "Client", file)),
  server: http.Server = http.createServer(
    async (
      request: http.IncomingMessage,
      response: http.ServerResponse<http.IncomingMessage>
    ) => {
      let Url = url.parse(request.url as string),
        urlPath = Url.pathname as string,
        parsedResource =
          Url.pathname == "/" ? "html" : path.extname(urlPath).substring(1),
        mimeType = mimetypes[parsedResource] || "application/octet-stream",
        file = path.join(
          path.resolve(__dirname, "../Client"),
          urlPath == "/" ? "/index.html" : urlPath
        );

      switch (urlPath[0]) {
        case "weather":
          break;
        default:
          response.writeHead(200, {
            "content-type": mimeType,
          });
          response.end(
            path.extname(urlPath).substring(1) == "png"
              ? await imageRenderer(file)
              : await weatherPageRenderer(file)
          );
          break;
      }
    }
  );

redisClient.on("error", (error: Error) => {
  console.log("Redis Client error");
  console.log(error.message);
});

server.listen(portNumber, async () => {
  await redisClient.connect();

  if (redisClient.isReady)
    console.log(
      "Redis client up and running, server is running at port",
      portNumber
    );
  else
    console.log(
      "Redis client down, server is up and running at port",
      portNumber
    );
});
