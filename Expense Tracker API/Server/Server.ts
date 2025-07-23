import http, { IncomingMessage, ServerResponse } from "http";
import { URL } from "url";

const jsonResponse = (payload: string | any) => {
    message: payload;
  },
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

      const requestUrl = URL.parse(request.url as string),
        parsedPaths = (requestUrl as URL).pathname.split("/").filter(Boolean);

      switch (parsedPaths[0]) {
        default:
          response.writeHead(200);
          response.end;
      }
    }
  );

server.listen(process.env.PORT, () => {
  console.log("Server is running at port", process.env.PORT);
});
