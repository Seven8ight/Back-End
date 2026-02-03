import http, { IncomingMessage, ServerResponse } from "http";
import { Router } from "./Router.js";
import { ConnectToServices } from "./Config/Config.js";
import { PORT } from "./Config/Env.js";

const Server = http.createServer(
  (request: IncomingMessage, response: ServerResponse<IncomingMessage>) =>
    Router(request, response),
);

Server.listen(PORT || 3000, async () => {
  try {
    await ConnectToServices();

    process.stdout.write(
      `Server, Database and Cache server are ready and listening, Server is on port ${process.env.PORT || 3000}`,
    );
  } catch (error) {
    console.log(error);
  }
});
