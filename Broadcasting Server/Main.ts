import http, { IncomingMessage, ServerResponse } from "http";
import { SERVER_PORT } from "./Config/Env";
import { IoServer } from "./Infrastructure/Sockets/Server";
import { Info } from "./Utils/Logger";
import {
  rabbitMQ,
  RabbitMQService,
} from "./Infrastructure/Message-Broker/RabbitMQ";
import { connectDatabase } from "./Config/Database";

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

httpServer.listen(SERVER_PORT, async () => {
  await rabbitMQ.connect();
  await connectDatabase();

  Info(
    `Server, Socket.io and RabbitMQ are up. Server is running at port ${SERVER_PORT}`,
  );
});
