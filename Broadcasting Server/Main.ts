import http, { IncomingMessage, ServerResponse } from "http";
import { SERVER_PORT } from "./Config/Env";
import { IoServer } from "./Infrastructure/Sockets/Server";
import { Info } from "./Utils/Logger";

const httpServer = http.createServer(
    (request: IncomingMessage, response: ServerResponse<IncomingMessage>) => {
      const requestUrl = new URL(
          request.url!,
          `http://${request.headers.host}`,
        ),
        pathNames = requestUrl.pathname.split("/").filter(Boolean);

      switch (pathNames[0]) {
        default:
          if (!response.writableEnded) {
            response.writeHead(200);
            response.end(
              JSON.stringify({
                message: "Index route, connection successful",
              }),
            );
          }
          break;
      }
    },
  ),
  _ = new IoServer(httpServer);

httpServer.listen(SERVER_PORT, () => {
  Info(`Server and Socket.io are up and running at port ${SERVER_PORT}`);
});
